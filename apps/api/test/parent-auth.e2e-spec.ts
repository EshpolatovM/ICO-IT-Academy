import { Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuditAction, Role } from '@lms/shared';
import type { ParentExchangeResponse, ParentTokensListResponse } from '@lms/shared';

import { PrismaService } from '../src/infra/prisma/prisma.service.js';

import { API, AuthFixtures, http, login } from './support/auth-fixtures.js';
import { createTestApp } from './support/create-test-app.js';
import {
  asParent,
  createParentToken,
  exchange,
  issueParentToken,
  pairOf,
  resetParentExchangeLimits,
  revokeParentToken,
  setCookieOf,
} from './support/parent-fixtures.js';

import type { TestUser } from './support/auth-fixtures.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

/** Faqat testda: `@Roles` siz (ANY) GET va mutatsiya endpointlari — ParentReadOnlyGuard tekshiruvi uchun. */
@Controller('e2e-parent-probe')
class ParentProbeController {
  @Get()
  read(): { ok: true } {
    return { ok: true };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  write(): { ok: true } {
    return { ok: true };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(): void {
    // bo'sh
  }
}

describe('Ota-ona kirishi va tokenlari (e2e)', () => {
  let app: INestApplication<App>;
  let fixtures: AuthFixtures;
  let admin: TestUser;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp({ controllers: [ParentProbeController] });
    fixtures = new AuthFixtures(app);
    admin = await fixtures.createUser({ role: Role.ADMIN });
    adminToken = (await login(app, admin)).accessToken;
  });

  beforeEach(async () => {
    await resetParentExchangeLimits(app);
  });

  /** Ikki student va har biriga admin yaratgan bittadan token. */
  async function twoChildrenWithTokens() {
    const first = await fixtures.createUser({ role: Role.STUDENT });
    const second = await fixtures.createUser({ role: Role.STUDENT });
    const tokenA = await issueParentToken(app, adminToken, first.id);
    const tokenB = await issueParentToken(app, adminToken, second.id);
    return { first, second, tokenA, tokenB };
  }

  afterAll(async () => {
    await resetParentExchangeLimits(app);
    await fixtures.cleanup();
    await app.close();
  });

  it('token → exchange → me → POST/DELETE 403 → revoke → 401; audit yoziladi', async () => {
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const created = await issueParentToken(app, adminToken, student.id);
    expect(created.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(created.link).toBe(`http://localhost:3000/parent?t=${created.token}`);
    expect(created.prefix).toBe(created.token.slice(0, 6));

    const exchanged = await exchange(app, { tokens: [created.token] }).expect(200);
    expect(exchanged.headers['referrer-policy']).toBe('no-referrer');
    expect(exchanged.body).toEqual({
      children: [{ studentId: student.id, firstName: 'E2E', lastName: 'STUDENT', groupName: null }],
    } satisfies ParentExchangeResponse);
    expect(setCookieOf(exchanged, 'ps')).toMatch(/HttpOnly/);
    expect(setCookieOf(exchanged, 'ps')).toMatch(/SameSite=Strict/);
    expect(setCookieOf(exchanged, 'parent_tokens')).toMatch(/Path=\/api\/v1\/auth\/parent/);
    expect(setCookieOf(exchanged, 'parent_tokens')).not.toContain(created.token);
    const parent = asParent(app, pairOf(exchanged, 'ps'));

    const me = await parent.get('/auth/me').expect(200);
    expect(me.body).toMatchObject({ role: 'PARENT', children: [{ studentId: student.id }] });
    await parent.get('/e2e-parent-probe').expect(200);
    await parent.post('/e2e-parent-probe').expect(403);
    await parent.delete('/e2e-parent-probe').expect(403);
    await parent.post(`/students/${student.id}/parent-tokens`).expect(403);

    await revokeParentToken(app, adminToken, { studentId: student.id, tokenId: created.id });
    await parent.get('/auth/me').expect(401);

    const actions = await app.get(PrismaService).db.auditLog.findMany({
      where: { entityId: created.id },
      select: { action: true, after: true },
    });
    expect(actions.map((row) => row.action).sort()).toEqual([
      AuditAction.PARENT_TOKEN_CREATED,
      AuditAction.PARENT_TOKEN_REVOKED,
    ]);
    expect(JSON.stringify(actions)).not.toContain(created.token);
  });

  it("body'siz exchange cookie bilan; merge ikkinchi farzandni qo'shadi; logout ikkala cookie'ni o'chiradi", async () => {
    const { first, second, tokenA, tokenB } = await twoChildrenWithTokens();

    const initial = await exchange(app, { tokens: [tokenA.token] }).expect(200);
    const merged = await exchange(
      app,
      { tokens: [tokenB.token], merge: true },
      pairOf(initial, 'parent_tokens'),
    ).expect(200);
    expect((merged.body as ParentExchangeResponse).children.map((c) => c.studentId)).toEqual([
      first.id,
      second.id,
    ]);

    const refreshed = await exchange(app, undefined, pairOf(merged, 'parent_tokens')).expect(200);
    expect((refreshed.body as ParentExchangeResponse).children).toHaveLength(2);
    expect(setCookieOf(refreshed, 'ps')).toBeDefined();

    await exchange(app).expect(401);
    await exchange(app, undefined, 'parent_tokens=v1.buzilgan').expect(401);

    const logout = await asParent(app, pairOf(refreshed, 'ps')).post('/auth/logout').expect(204);
    expect(setCookieOf(logout, 'ps')).toMatch(/^ps=;.*Expires=Thu, 01 Jan 1970/);
    expect(setCookieOf(logout, 'parent_tokens')).toMatch(/^parent_tokens=;/);
  });

  it("bekor qilingan token cookie'dan chiqadi, qolgan farzand ishlaydi", async () => {
    const { first, second, tokenA, tokenB } = await twoChildrenWithTokens();
    const session = await exchange(app, { tokens: [tokenA.token, tokenB.token] }).expect(200);

    await revokeParentToken(app, adminToken, { studentId: first.id, tokenId: tokenA.id });

    const me = await asParent(app, pairOf(session, 'ps')).get('/auth/me').expect(200);
    expect(me.body).toMatchObject({ children: [{ studentId: second.id }] });
    const refreshed = await exchange(app, undefined, pairOf(session, 'parent_tokens')).expect(200);
    expect((refreshed.body as ParentExchangeResponse).children.map((c) => c.studentId)).toEqual([
      second.id,
    ]);
  });

  it('regenerate: eski token ishlamaydi, yangisi ishlaydi; limit — 4-token 409', async () => {
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const original = await issueParentToken(app, adminToken, student.id);

    const regenerated = await http(app)
      .post(`${API}/students/${student.id}/parent-tokens/${original.id}/regenerate`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);
    const fresh = regenerated.body as { id: string; token: string; label: string };
    expect(fresh.id).not.toBe(original.id);
    expect(fresh.label).toBe('Onasi');
    await exchange(app, { tokens: [original.token] }).expect(401);
    await exchange(app, { tokens: [fresh.token] }).expect(200);

    await issueParentToken(app, adminToken, student.id);
    await issueParentToken(app, adminToken, student.id);
    const overLimit = await createParentToken(app, adminToken, student.id).expect(409);
    expect(overLimit.body).toMatchObject({ error: { code: 'CONFLICT', details: { limit: 3 } } });

    const list = await http(app)
      .get(`${API}/students/${student.id}/parent-tokens`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    const items = (list.body as ParentTokensListResponse).items;
    expect(items).toHaveLength(3);
    expect(JSON.stringify(items)).not.toContain(fresh.token);
    expect(items.find((item) => item.id === fresh.id)?.useCount).toBe(1);
  });

  it('exchange rate limit: 10 urinishdan keyin 429', async () => {
    const wrong = { tokens: ['x'.repeat(43)] };
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await exchange(app, wrong).expect(401);
    }
    const limited = await exchange(app, wrong).expect(429);
    expect(limited.body).toMatchObject({ error: { code: 'RATE_LIMITED' } });
  });

  it('mentor: parent-token endpointlari 403 (2-bosqichgacha); begona student — 404; student — 403', async () => {
    const mentor = await fixtures.createUser({ role: Role.MENTOR });
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const mentorToken = (await login(app, mentor)).accessToken;
    const studentToken = (await login(app, student)).accessToken;

    await createParentToken(app, mentorToken, student.id).expect(403);
    await http(app)
      .get(`${API}/students/${student.id}/parent-tokens`)
      .auth(mentorToken, { type: 'bearer' })
      .expect(403);
    await createParentToken(app, studentToken, student.id).expect(403);
    await createParentToken(app, adminToken, mentor.id).expect(404);
  });
});
