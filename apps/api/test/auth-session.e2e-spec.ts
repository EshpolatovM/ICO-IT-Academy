import { randomUUID } from 'node:crypto';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, ErrorCode, Role } from '@lms/shared';
import type { AuthSessionsResponse } from '@lms/shared';

import { AppConfigService } from '../src/common/config/app-config.service.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';
import { hashRefreshToken } from '../src/modules/auth/services/refresh-token.service.js';

import {
  API,
  AuthFixtures,
  cookiePair,
  http,
  login,
  refreshRequest,
  refreshSetCookie,
  statusCounts,
  TEST_PASSWORD,
} from './support/auth-fixtures.js';
import { createTestApp } from './support/create-test-app.js';

import type { TestUser } from './support/auth-fixtures.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

const NEW_PASSWORD = 'Yangi$Parol9';
const MS_PER_SECOND = 1000;
/** Limitdan ortiq yuboriladigan parallel urinishlar soni. */
const EXTRA_ATTEMPTS = 2;

describe('Auth: parol almashtirish, refresh, sessiyalar, chiqish (e2e)', () => {
  let app: INestApplication<App>;
  let fixtures: AuthFixtures;

  beforeAll(async () => {
    app = await createTestApp();
    fixtures = new AuthFixtures(app);
  });

  afterAll(async () => {
    await fixtures.cleanup();
    await app.close();
  });

  it('student mcp=true: boshqa endpoint 403 → change-password → yangi token bilan ishlaydi', async () => {
    const student = await fixtures.createUser({ role: Role.STUDENT, mustChangePassword: true });
    const first = await login(app, student);
    const bearer = { type: 'bearer' } as const;

    const blocked = await http(app)
      .get(`${API}/auth/sessions`)
      .auth(first.accessToken, bearer)
      .expect(403);
    expect(blocked.body).toMatchObject({ error: { code: 'PASSWORD_CHANGE_REQUIRED' } });
    await http(app).get(`${API}/auth/me`).auth(first.accessToken, bearer).expect(200);

    const changed = await http(app)
      .post(`${API}/auth/change-password`)
      .auth(first.accessToken, bearer)
      .send({ oldPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD })
      .expect(200);
    expect(changed.body).toEqual({ accessToken: expect.any(String) as string, expiresIn: 900 });
    expect(refreshSetCookie(changed)).toBeDefined();

    // token_version oshdi: eski access va eski refresh ishlamaydi.
    await http(app).get(`${API}/auth/me`).auth(first.accessToken, bearer).expect(401);
    await refreshRequest(app, first.cookie).expect(401);

    const { accessToken } = changed.body as { accessToken: string };
    const me = await http(app).get(`${API}/auth/me`).auth(accessToken, bearer).expect(200);
    expect(me.body).toMatchObject({ mustChangePassword: false });
    await http(app).get(`${API}/auth/sessions`).auth(accessToken, bearer).expect(200);
  });

  it("change-password: eski parol noto'g'ri — 400, siyosatga mos bo'lmagan yangi parol — 400", async () => {
    const mentor = await fixtures.createUser({ role: Role.MENTOR });
    const { accessToken } = await login(app, mentor);
    const send = (body: object) =>
      http(app)
        .post(`${API}/auth/change-password`)
        .auth(accessToken, { type: 'bearer' })
        .send(body);

    const wrongOld = await send({ oldPassword: 'NotoGri123', newPassword: NEW_PASSWORD }).expect(
      400,
    );
    expect(wrongOld.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR', details: [{ field: 'oldPassword' }] },
    });
    await send({ oldPassword: TEST_PASSWORD, newPassword: 'qisqa' }).expect(400);
  });

  it('refresh: X-Requested-With siz — 403; rotation; grace ichida eski token — REFRESH_SUPERSEDED, sessiya saqlanadi', async () => {
    const mentor = await fixtures.createUser({ role: Role.MENTOR });
    const session = await login(app, mentor);

    await http(app).post(`${API}/auth/refresh`).set('Cookie', session.cookie).expect(403);
    await http(app).post(`${API}/auth/refresh`).expect(403);

    const rotated = await refreshRequest(app, session.cookie).expect(200);
    expect(rotated.body).toEqual({ accessToken: expect.any(String) as string, expiresIn: 900 });
    const nextCookie = cookiePair(refreshSetCookie(rotated));
    expect(nextCookie).not.toBe(session.cookie);

    const superseded = await refreshRequest(app, session.cookie).expect(401);
    expect(superseded.body).toMatchObject({ error: { code: ErrorCode.REFRESH_SUPERSEDED } });
    expect(refreshSetCookie(superseded)).toBeUndefined();
    // Oila bekor qilinmadi: yangi token ishlaydi.
    await refreshRequest(app, nextCookie).expect(200);
  });

  it("refresh: parallel tablar bir vaqtda — bittasi 200, qolganlari REFRESH_SUPERSEDED, sessiya o'lmaydi", async () => {
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const session = await login(app, student);

    const responses = await Promise.all(
      Array.from({ length: 3 }, () => refreshRequest(app, session.cookie)),
    );

    const ok = responses.filter((response) => response.status === 200);
    const rest = responses.filter((response) => response.status !== 200);
    expect(ok).toHaveLength(1);
    for (const response of rest) {
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({ error: { code: ErrorCode.REFRESH_SUPERSEDED } });
    }
    const [winner] = ok;
    expect(winner).toBeDefined();
    const winnerCookie = cookiePair(winner ? refreshSetCookie(winner) : undefined);
    await refreshRequest(app, winnerCookie).expect(200);
  });

  it('refresh: grace oynasidan keyin eski token qayta kelsa — 401 va oila bekor (reuse detection)', async () => {
    const mentor = await fixtures.createUser({ role: Role.MENTOR });
    const session = await login(app, mentor);
    const rotated = await refreshRequest(app, session.cookie).expect(200);
    const nextCookie = cookiePair(refreshSetCookie(rotated));
    const graceSeconds = app.get(AppConfigService).get('REFRESH_REUSE_GRACE_SECONDS');
    await app.get(PrismaService).db.refreshToken.update({
      where: { tokenHash: hashRefreshToken(session.cookie.replace('rt=', '')) },
      data: { revokedAt: new Date(Date.now() - (graceSeconds + 1) * MS_PER_SECOND) },
    });

    const reused = await refreshRequest(app, session.cookie).expect(401);
    expect(reused.body).toMatchObject({ error: { code: ErrorCode.UNAUTHORIZED } });
    await refreshRequest(app, nextCookie).expect(401);
  });

  it("sessiyalar: ro'yxat (joriy belgilangan), boshqasini o'chirish, begona id — 404", async () => {
    const user: TestUser = await fixtures.createUser({ role: Role.ADMIN });
    const laptop = await login(app, user);
    const phone = await login(app, user);
    const list = () =>
      http(app)
        .get(`${API}/auth/sessions`)
        .auth(laptop.accessToken, { type: 'bearer' })
        .set('Cookie', laptop.cookie)
        .expect(200);

    const before = (await list()).body as AuthSessionsResponse;
    expect(before.items).toHaveLength(2);
    const current = before.items.find((item) => item.current);
    const other = before.items.find((item) => !item.current);
    expect(current).toBeDefined();

    await http(app)
      .delete(`${API}/auth/sessions/${other?.id ?? ''}`)
      .auth(laptop.accessToken, { type: 'bearer' })
      .expect(204);
    const after = (await list()).body as AuthSessionsResponse;
    expect(after.items.map((item) => item.id)).toEqual([current?.id]);
    await refreshRequest(app, phone.cookie).expect(401);

    const remove = (id: string) =>
      http(app).delete(`${API}/auth/sessions/${id}`).auth(laptop.accessToken, { type: 'bearer' });
    await remove(randomUUID()).expect(404);
    const badId = await remove('not-a-uuid').expect(400);
    expect(badId.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR', details: [{ field: 'id' }] },
    });
  });

  it('logout: X-Requested-With siz — 403 (CSRF); 204, cookie tozalanadi, refresh endi ishlamaydi', async () => {
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const session = await login(app, student);

    const logout = () =>
      http(app)
        .post(`${API}/auth/logout`)
        .auth(session.accessToken, { type: 'bearer' })
        .set('Cookie', session.cookie);

    const noCsrf = await logout().expect(403);
    expect(noCsrf.body).toMatchObject({ error: { code: ErrorCode.FORBIDDEN } });
    const response = await logout().set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE).expect(204);

    expect(refreshSetCookie(response)).toMatch(/^rt=;.*Expires=Thu, 01 Jan 1970/);
    await refreshRequest(app, session.cookie).expect(401);
  });

  it("change-password: eski parol bo'yicha urinishlar limiti — keyingisi 429 (to'g'ri parol bilan ham)", async () => {
    const mentor = await fixtures.createUser({ role: Role.MENTOR });
    const { accessToken } = await login(app, mentor);
    const send = (oldPassword: string) =>
      http(app)
        .post(`${API}/auth/change-password`)
        .auth(accessToken, { type: 'bearer' })
        .send({ oldPassword, newPassword: NEW_PASSWORD });

    const maxAttempts = app.get(AppConfigService).get('CHANGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS');

    const wrong = await Promise.all(
      Array.from({ length: maxAttempts + EXTRA_ATTEMPTS }, () => send('NotoGri123')),
    );

    expect(statusCounts(wrong)).toEqual({ 400: maxAttempts, 429: EXTRA_ATTEMPTS });
    const limited = await send(TEST_PASSWORD).expect(429);
    expect(limited.body).toMatchObject({ error: { code: ErrorCode.RATE_LIMITED } });
  });
});
