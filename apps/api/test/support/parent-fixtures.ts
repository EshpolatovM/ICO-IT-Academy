import type { ParentTokenCreatedResponse } from '@lms/shared';

import { RedisService } from '../../src/infra/redis/redis.service.js';
import {
  PARENT_EXCHANGE_ATTEMPTS_KEY_PREFIX,
  PARENT_EXCHANGE_FAILURES_KEY_PREFIX,
} from '../../src/modules/auth/auth.constants.js';

import { API, http } from './auth-fixtures.js';

import type { INestApplication } from '@nestjs/common';
import type request from 'supertest';
import type { App } from 'supertest/types.js';

/** Supertest so'rovlari keladigan lokal manzil ko'rinishlari (rate limit kalitlari uchun). */
const LOCAL_IPS = ['::ffff:127.0.0.1', '127.0.0.1', '::1'];
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;

/**
 * Exchange rate limit hisoblagichlarini tozalaydi (testlar bir IP'dan keladi; `X-Forwarded-For`
 * bilan "mijoz" IP'lari `extraIps` da beriladi).
 */
export async function resetParentExchangeLimits(
  app: INestApplication<App>,
  extraIps: readonly string[] = [],
): Promise<void> {
  const redis = app.get(RedisService);
  for (const ip of [...LOCAL_IPS, ...extraIps]) {
    await redis.del(`${PARENT_EXCHANGE_ATTEMPTS_KEY_PREFIX}${ip}`);
    await redis.del(`${PARENT_EXCHANGE_FAILURES_KEY_PREFIX}${ip}`);
  }
}

/** `Set-Cookie` dan berilgan nomli cookie'ning to'liq satri. */
export function setCookieOf(response: request.Response, name: string): string | undefined {
  const raw: unknown = response.headers['set-cookie'];
  const cookies = Array.isArray(raw) ? (raw as string[]) : [];
  return cookies.find((cookie) => cookie.startsWith(`${name}=`));
}

export function pairOf(response: request.Response, name: string): string {
  return (setCookieOf(response, name) ?? '').split(';')[0] ?? '';
}

export function createParentToken(
  app: INestApplication<App>,
  accessToken: string,
  studentId: string,
  label = 'Onasi',
) {
  return http(app)
    .post(`${API}/students/${studentId}/parent-tokens`)
    .auth(accessToken, { type: 'bearer' })
    .send({ label });
}

export async function issueParentToken(
  app: INestApplication<App>,
  accessToken: string,
  studentId: string,
): Promise<ParentTokenCreatedResponse> {
  const response = await createParentToken(app, accessToken, studentId).expect(HTTP_CREATED);
  return response.body as ParentTokenCreatedResponse;
}

export async function revokeParentToken(
  app: INestApplication<App>,
  accessToken: string,
  token: { studentId: string; tokenId: string },
): Promise<void> {
  await http(app)
    .delete(`${API}/students/${token.studentId}/parent-tokens/${token.tokenId}`)
    .auth(accessToken, { type: 'bearer' })
    .expect(HTTP_NO_CONTENT);
}

export function exchange(
  app: INestApplication<App>,
  body?: object,
  cookie?: string,
  forwardedFor?: string,
) {
  const req = http(app).post(`${API}/auth/parent/exchange`);
  if (cookie) {
    req.set('Cookie', cookie);
  }
  if (forwardedFor) {
    req.set('X-Forwarded-For', forwardedFor);
  }
  return body === undefined ? req : req.send(body);
}

/** Ota-ona sessiyasi bilan so'rov (`ps` cookie). */
export function asParent(app: INestApplication<App>, psCookie: string) {
  return {
    get: (path: string) => http(app).get(`${API}${path}`).set('Cookie', psCookie),
    post: (path: string) => http(app).post(`${API}${path}`).set('Cookie', psCookie),
    delete: (path: string) => http(app).delete(`${API}${path}`).set('Cookie', psCookie),
  };
}
