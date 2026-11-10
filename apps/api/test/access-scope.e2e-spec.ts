import { randomUUID } from 'node:crypto';

import { JwtService } from '@nestjs/jwt';

import { Role, UserStatus } from '@lms/shared';
import type { ParentTokenCreatedResponse } from '@lms/shared';

import { PrismaService } from '../src/infra/prisma/prisma.service.js';

import { API, http, login, loginRequest, refreshRequest } from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';
import {
  asParent,
  createParentToken,
  exchange,
  issueParentToken,
  pairOf,
  resetParentExchangeLimits,
} from './support/parent-fixtures.js';

import type { TestUser } from './support/auth-fixtures.js';

/**
 * Scope va chekka holatlar (RBAC matritsasini to'ldiradi): begona student resurslari (IDOR),
 * mavjud bo'lmagan yozuvlar, validatsiya, buzilgan/muddati o'tgan tokenlar, ota-ona tokeni holatlari.
 */
describe('Scope va chekka holatlar (e2e)', () => {
  const context = useE2eContext();
  let admin: TestUser;
  let adminToken: string;

  beforeAll(async () => {
    admin = await context.fixtures.createUser({ role: Role.ADMIN });
    adminToken = (await login(context.app, admin)).accessToken;
  });

  beforeEach(async () => {
    await resetParentExchangeLimits(context.app);
  });

  const asAdmin = {
    get: (path: string) =>
      http(context.app).get(`${API}${path}`).auth(adminToken, { type: 'bearer' }),
    post: (path: string) =>
      http(context.app).post(`${API}${path}`).auth(adminToken, { type: 'bearer' }),
    delete: (path: string) =>
      http(context.app).delete(`${API}${path}`).auth(adminToken, { type: 'bearer' }),
  };

  async function studentWithToken(): Promise<{
    student: TestUser;
    token: ParentTokenCreatedResponse;
  }> {
    const student = await context.fixtures.createUser({ role: Role.STUDENT });
    return { student, token: await issueParentToken(context.app, adminToken, student.id) };
  }

  it("token boshqa studentniki — DELETE va regenerate 404 (IDOR), token o'zgarmaydi", async () => {
    const owner = await studentWithToken();
    const other = await context.fixtures.createUser({ role: Role.STUDENT });

    await asAdmin.delete(`/students/${other.id}/parent-tokens/${owner.token.id}`).expect(404);
    await asAdmin
      .post(`/students/${other.id}/parent-tokens/${owner.token.id}/regenerate`)
      .expect(404);

    await exchange(context.app, { tokens: [owner.token.token] }).expect(200);
  });

  it("bekor qilingan tokenni qayta bekor qilish / regenerate — 404; noma'lum token — 404", async () => {
    const { student, token } = await studentWithToken();
    const path = `/students/${student.id}/parent-tokens/${token.id}`;

    await asAdmin.delete(path).expect(204);
    await asAdmin.delete(path).expect(404);
    await asAdmin.post(`${path}/regenerate`).expect(404);
    await asAdmin.delete(`/students/${student.id}/parent-tokens/${randomUUID()}`).expect(404);
  });

  it("mavjud bo'lmagan student — 404; student emas (xodim) — 404; noto'g'ri UUID — 400", async () => {
    const missing = randomUUID();
    await asAdmin.get(`/students/${missing}/parent-tokens`).expect(404);
    await asAdmin.post(`/students/${missing}/parent-tokens`).send({}).expect(404);
    await asAdmin.post(`/students/${missing}/reset-password`).expect(404);
    await asAdmin.post(`/staff/${missing}/reset-password`).expect(404);
    await asAdmin.get(`/students/${admin.id}/parent-tokens`).expect(404);

    await asAdmin.get('/students/not-a-uuid/parent-tokens').expect(400);
    await asAdmin.delete(`/students/${missing}/parent-tokens/not-a-uuid`).expect(400);
  });

  it("token yorlig'i: 64 belgidan uzun — 400, bo'sh body — 201 (label null)", async () => {
    const student = await context.fixtures.createUser({ role: Role.STUDENT });

    const tooLong = await createParentToken(context.app, adminToken, student.id, 'x'.repeat(65));
    expect(tooLong.status).toBe(400);
    expect(tooLong.body).toMatchObject({ error: { details: [{ field: 'label' }] } });

    const created = await asAdmin.post(`/students/${student.id}/parent-tokens`).expect(201);
    expect(created.body).toMatchObject({ label: null });
  });

  it('student begona studentga, ota-ona begona farzandga — 403 (rol darajasida)', async () => {
    const { app, fixtures } = context;
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const stranger = await studentWithToken();
    const studentToken = (await login(app, student)).accessToken;

    await http(app)
      .get(`${API}/students/${stranger.student.id}/parent-tokens`)
      .auth(studentToken, { type: 'bearer' })
      .expect(403);
    await http(app)
      .post(`${API}/students/${stranger.student.id}/reset-password`)
      .auth(studentToken, { type: 'bearer' })
      .expect(403);

    const own = await studentWithToken();
    const session = await exchange(app, { tokens: [own.token.token] }).expect(200);
    const parent = asParent(app, pairOf(session, 'ps'));
    await parent.get(`/students/${stranger.student.id}/parent-tokens`).expect(403);
    await parent.post(`/students/${stranger.student.id}/reset-password`).expect(403);
  });

  it("regenerate: eski token bilan ochilgan ota-ona sessiyasi keyingi so'rovda 401", async () => {
    const { student, token } = await studentWithToken();
    const session = await exchange(context.app, { tokens: [token.token] }).expect(200);
    const parent = asParent(context.app, pairOf(session, 'ps'));
    await parent.get('/auth/me').expect(200);

    await asAdmin.post(`/students/${student.id}/parent-tokens/${token.id}/regenerate`).expect(201);

    await parent.get('/auth/me').expect(401);
  });

  it("muddati o'tgan yoki INACTIVE studentning tokeni — exchange 401", async () => {
    const prisma = context.app.get(PrismaService).dbIncludingDeleted;
    const expired = await studentWithToken();
    await prisma.parentAccessToken.update({
      where: { id: expired.token.id },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    const inactive = await studentWithToken();
    await prisma.user.update({
      where: { id: inactive.student.id },
      data: { status: UserStatus.INACTIVE },
    });

    await exchange(context.app, { tokens: [expired.token.token] }).expect(401);
    await exchange(context.app, { tokens: [inactive.token.token] }).expect(401);
  });

  it("access token: muddati o'tgan, boshqa kalit bilan imzolangan, PARENT roli — 401", async () => {
    const jwt = context.app.get(JwtService);
    const payload = { sub: admin.id, role: Role.ADMIN, mcp: false, ver: 0 };
    const forged = [
      await jwt.signAsync(payload, { expiresIn: -60 }),
      await jwt.signAsync(payload, { secret: 'boshqa-kalit-'.repeat(4) }),
      await jwt.signAsync({ ...payload, role: Role.PARENT }),
    ];

    for (const token of forged) {
      const response = await http(context.app)
        .get(`${API}/auth/me`)
        .auth(token, { type: 'bearer' })
        .expect(401);
      expect(response.body).toMatchObject({ error: { code: 'UNAUTHORIZED' } });
    }
  });

  it("refresh: cookie yo'q yoki noma'lum — 401", async () => {
    await refreshRequest(context.app, '').expect(401);
    await refreshRequest(context.app, 'rt=nomalum-token').expect(401);
  });

  it('student login: INACTIVE — 401, validatsiya — 400, 5 xatodan keyin — 429', async () => {
    const { app, fixtures } = context;
    const inactive = await fixtures.createUser({ role: Role.STUDENT, status: UserStatus.INACTIVE });
    await loginRequest(app, inactive).expect(401);

    const invalid = await http(app).post(`${API}/auth/student/login`).send({ password: 'x' });
    expect(invalid.status).toBe(400);
    expect(invalid.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });

    const target = await fixtures.createUser({ role: Role.STUDENT });
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await loginRequest(app, target, 'NotoGri123').expect(401);
    }
    await loginRequest(app, target).expect(429);
  });
});
