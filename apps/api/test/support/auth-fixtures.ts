import request from 'supertest';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, Role, UserStatus } from '@lms/shared';
import type { AccountRole, LoginResponse } from '@lms/shared';

import { PASSWORD_HASHER } from '../../src/common/security/password-hasher.interface.js';
import { PrismaService } from '../../src/infra/prisma/prisma.service.js';

import {
  deleteTestUsers,
  randomTestPhone,
  randomTestStudentCode,
  TEST_PASSWORD,
} from './test-users.js';

import type { PasswordHasher } from '../../src/common/security/password-hasher.interface.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

export const API = '/api/v1';
export { TEST_PASSWORD };
const HTTP_OK = 200;

export interface TestUser {
  id: string;
  role: AccountRole;
  phone: string | null;
  studentCode: string | null;
}

interface CreateUserOptions {
  role: AccountRole;
  status?: UserStatus;
  mustChangePassword?: boolean;
}

/**
 * Test foydalanuvchilarini yaratadi va faqat o'zi yaratganlarini o'chiradi (dev seed'ga tayanmaydi,
 * mavjud yozuvlarga tegmaydi). Telefon/kod — tasodifiy, `E2E-` prefiksli kod sequence'ni sarflamaydi.
 */
export class AuthFixtures {
  private readonly createdIds: string[] = [];

  constructor(private readonly app: INestApplication<App>) {}

  async createUser(options: CreateUserOptions): Promise<TestUser> {
    const isStudent = options.role === Role.STUDENT;
    const hasher = this.app.get<PasswordHasher>(PASSWORD_HASHER);
    const user = await this.prisma().dbIncludingDeleted.user.create({
      data: {
        role: options.role,
        phone: isStudent ? null : randomTestPhone(),
        studentCode: isStudent ? randomTestStudentCode() : null,
        passwordHash: await hasher.hash(TEST_PASSWORD),
        mustChangePassword: options.mustChangePassword ?? false,
        firstName: 'E2E',
        lastName: options.role,
        status: options.status ?? UserStatus.ACTIVE,
      },
      select: { id: true, role: true, phone: true, studentCode: true },
    });
    this.createdIds.push(user.id);
    return user;
  }

  /** Faqat shu fixture yaratgan foydalanuvchilar va ularga bog'langan yozuvlar o'chiriladi. */
  async cleanup(): Promise<void> {
    await deleteTestUsers(this.prisma().dbIncludingDeleted, this.createdIds);
  }

  private prisma(): PrismaService {
    return this.app.get(PrismaService);
  }
}

export function http(app: INestApplication<App>) {
  return request(app.getHttpServer());
}

export function loginRequest(app: INestApplication<App>, user: TestUser, password = TEST_PASSWORD) {
  return user.role === Role.STUDENT
    ? http(app).post(`${API}/auth/student/login`).send({ studentCode: user.studentCode, password })
    : http(app).post(`${API}/auth/staff/login`).send({ phone: user.phone, password });
}

export interface LoggedIn {
  accessToken: string;
  /** `rt=...` — keyingi so'rovlarning `Cookie` sarlavhasi uchun. */
  cookie: string;
  body: LoginResponse;
}

/** `Set-Cookie` dan `rt` cookie'ning to'liq satri (atributlari bilan). */
export function refreshSetCookie(response: request.Response): string | undefined {
  const raw: unknown = response.headers['set-cookie'];
  const cookies = Array.isArray(raw) ? (raw as string[]) : [];
  return cookies.find((cookie) => cookie.startsWith('rt='));
}

export function cookiePair(setCookie: string | undefined): string {
  return (setCookie ?? '').split(';')[0] ?? '';
}

export async function login(app: INestApplication<App>, user: TestUser): Promise<LoggedIn> {
  const response = await loginRequest(app, user).expect(HTTP_OK);
  const body = response.body as LoginResponse;
  return { accessToken: body.accessToken, cookie: cookiePair(refreshSetCookie(response)), body };
}

export function refreshRequest(app: INestApplication<App>, cookie: string) {
  return http(app)
    .post(`${API}/auth/refresh`)
    .set('Cookie', cookie)
    .set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE);
}

/** Parallel so'rovlar natijasi: HTTP holati → nechta javob (rate limit testlari uchun). */
export function statusCounts(responses: readonly request.Response[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const { status } of responses) {
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}
