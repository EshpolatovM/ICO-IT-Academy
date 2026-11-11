import { JwtService } from '@nestjs/jwt';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, Role } from '@lms/shared';

import { PARENT_SESSION_AUDIENCE } from '../src/modules/auth/auth.constants.js';

import { API, http, login } from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';
import {
  asParent,
  exchange,
  issueParentToken,
  pairOf,
  resetParentExchangeLimits,
  setCookieOf,
} from './support/parent-fixtures.js';

/** `X-Forwarded-For` orqali kelgan ikki xil "mijoz" (TEST-NET-3, RFC 5737). */
const CLIENT_A = '203.0.113.10';
const CLIENT_B = '203.0.113.20';
/** `.env.example`/CI: PARENT_EXCHANGE_MAX_ATTEMPTS=10, MAX_FAILURES=20. */
const MAX_ATTEMPTS = 10;
const NO_TOKEN_CALLS = 25;
const WRONG = { tokens: ['x'.repeat(43)] };
const EXPIRED_SECONDS_AGO = -60;
const CLEARED = /=;.*Expires=Thu, 01 Jan 1970/;

describe("Ota-ona: trust proxy, token'siz exchange, sessiyasiz chiqish (e2e)", () => {
  // `useE2eContext` dagi `afterAll` (ilovani yopish) dan oldin ishlashi uchun avval ro'yxatga olinadi.
  afterAll(async () => {
    await resetParentExchangeLimits(ctx.app, [CLIENT_A, CLIENT_B]);
  });
  const ctx = useE2eContext();

  beforeEach(async () => {
    await resetParentExchangeLimits(ctx.app, [CLIENT_A, CLIENT_B]);
  });

  it("TRUST_PROXY=loopback: limit X-Forwarded-For dagi mijoz IP bo'yicha, boshqa mijoz bloklanmaydi", async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await exchange(ctx.app, WRONG, undefined, CLIENT_A).expect(401);
    }
    await exchange(ctx.app, WRONG, undefined, CLIENT_A).expect(429);

    await exchange(ctx.app, WRONG, undefined, CLIENT_B).expect(401);
    await exchange(ctx.app, WRONG).expect(401);
  });

  it("cookie'siz va body'siz exchange limitga qo'shilmaydi (25 marta — 429 yo'q)", async () => {
    for (let call = 0; call < NO_TOKEN_CALLS; call += 1) {
      const response = await exchange(ctx.app).expect(401);
      expect(response.body).toMatchObject({ error: { code: 'UNAUTHORIZED' } });
    }
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await exchange(ctx.app, WRONG).expect(401);
    }
    await exchange(ctx.app, WRONG).expect(429);
  });

  it('buzilgan parent_tokens cookie — xato urinish sifatida sanaladi', async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await exchange(ctx.app, undefined, 'parent_tokens=v1.buzilgan').expect(401);
    }
    await exchange(ctx.app, undefined, 'parent_tokens=v1.buzilgan').expect(429);
  });

  it("muddati o'tgan ps bilan POST /auth/parent/logout — 204, ikkala cookie o'chiriladi", async () => {
    const admin = await ctx.fixtures.createUser({ role: Role.ADMIN });
    const student = await ctx.fixtures.createUser({ role: Role.STUDENT });
    const adminToken = (await login(ctx.app, admin)).accessToken;
    const created = await issueParentToken(ctx.app, adminToken, student.id);
    const session = await exchange(ctx.app, { tokens: [created.token] }).expect(200);
    const expiredPs = await ctx.app
      .get(JwtService)
      .signAsync(
        { role: Role.PARENT, tokenIds: [created.id], studentIds: [student.id] },
        { subject: created.id, audience: PARENT_SESSION_AUDIENCE, expiresIn: EXPIRED_SECONDS_AGO },
      );
    const cookies = `ps=${expiredPs}; ${pairOf(session, 'parent_tokens')}`;
    await asParent(ctx.app, `ps=${expiredPs}`).get('/auth/me').expect(401);

    const logout = await http(ctx.app)
      .post(`${API}/auth/parent/logout`)
      .set('Cookie', cookies)
      .set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE)
      .expect(204);

    expect(setCookieOf(logout, 'ps')).toMatch(CLEARED);
    expect(setCookieOf(logout, 'ps')).toMatch(/Path=\/api\/v1;/);
    expect(setCookieOf(logout, 'parent_tokens')).toMatch(CLEARED);
    expect(setCookieOf(logout, 'parent_tokens')).toMatch(/Path=\/api\/v1\/auth\/parent/);
  });

  it("parent logout cookie'siz ham 204; X-Requested-With yo'q — 403", async () => {
    await http(ctx.app)
      .post(`${API}/auth/parent/logout`)
      .set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE)
      .expect(204);
    await http(ctx.app).post(`${API}/auth/parent/logout`).expect(403);
  });
});
