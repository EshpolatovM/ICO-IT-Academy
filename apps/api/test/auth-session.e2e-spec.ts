import { randomUUID } from 'node:crypto';

import { Role } from '@lms/shared';
import type { AuthSessionsResponse } from '@lms/shared';

import {
  API,
  AuthFixtures,
  cookiePair,
  http,
  login,
  refreshRequest,
  refreshSetCookie,
  TEST_PASSWORD,
} from './support/auth-fixtures.js';
import { createTestApp } from './support/create-test-app.js';

import type { TestUser } from './support/auth-fixtures.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

const NEW_PASSWORD = 'Yangi$Parol9';

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

  it('refresh: X-Requested-With siz — 403; rotation; eski token qayta kelsa — 401 va oila bekor', async () => {
    const mentor = await fixtures.createUser({ role: Role.MENTOR });
    const session = await login(app, mentor);

    await http(app).post(`${API}/auth/refresh`).set('Cookie', session.cookie).expect(403);
    await http(app).post(`${API}/auth/refresh`).expect(403);

    const rotated = await refreshRequest(app, session.cookie).expect(200);
    expect(rotated.body).toEqual({ accessToken: expect.any(String) as string, expiresIn: 900 });
    const nextCookie = cookiePair(refreshSetCookie(rotated));
    expect(nextCookie).not.toBe(session.cookie);

    await refreshRequest(app, session.cookie).expect(401);
    // Reuse detection: shu oiladagi yangi token ham bekor bo'ldi.
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
    await remove('not-a-uuid').expect(400);
  });

  it('logout: 204, cookie tozalanadi, refresh endi ishlamaydi', async () => {
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const session = await login(app, student);

    const response = await http(app)
      .post(`${API}/auth/logout`)
      .auth(session.accessToken, { type: 'bearer' })
      .set('Cookie', session.cookie)
      .expect(204);

    expect(refreshSetCookie(response)).toMatch(/^rt=;.*Expires=Thu, 01 Jan 1970/);
    await refreshRequest(app, session.cookie).expect(401);
  });
});
