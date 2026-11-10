import { randomInt } from 'node:crypto';

import { Controller, Get } from '@nestjs/common';

import { Role, UserStatus } from '@lms/shared';

import { AppConfigService } from '../src/common/config/app-config.service.js';
import { Roles } from '../src/common/decorators/roles.decorator.js';
import { RedisService } from '../src/infra/redis/redis.service.js';
import { LOGIN_IP_ATTEMPTS_KEY_PREFIX } from '../src/modules/auth/auth.constants.js';

import {
  API,
  AuthFixtures,
  http,
  login,
  loginRequest,
  refreshSetCookie,
  statusCounts,
  TEST_PASSWORD,
} from './support/auth-fixtures.js';
import { createTestApp } from './support/create-test-app.js';
import { randomTestPhone } from './support/test-users.js';

import type { TestUser } from './support/auth-fixtures.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

/** Faqat testda: `@Roles` va global guard'lar tartibini tekshirish uchun endpointlar. */
@Controller('e2e-probe')
class RolesProbeController {
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin-only')
  adminOnly(): { ok: true } {
    return { ok: true };
  }
}

/** Limitdan ortiq yuboriladigan parallel urinishlar soni. */
const EXTRA_ATTEMPTS = 3;
/** TEST-NET-2 (RFC 5737) — haqiqiy mijoz bo'lmagan, har ishga tushirishda boshqa "mijoz" IP'si. */
const TEST_NET_PREFIX = '198.51.100.';
const MAX_OCTET = 255;

const INVALID_CREDENTIALS = {
  error: { code: 'UNAUTHORIZED', message: "Login yoki parol noto'g'ri", details: null },
};

describe('Auth: kirish, me, rollar (e2e)', () => {
  let app: INestApplication<App>;
  let fixtures: AuthFixtures;
  let mentor: TestUser;
  let admin: TestUser;

  beforeAll(async () => {
    app = await createTestApp({ controllers: [RolesProbeController] });
    fixtures = new AuthFixtures(app);
    mentor = await fixtures.createUser({ role: Role.MENTOR });
    admin = await fixtures.createUser({ role: Role.ADMIN });
  });

  afterAll(async () => {
    await fixtures.cleanup();
    await app.close();
  });

  it('staff login → 200 docs/12 §1 shaklida, rt cookie atributlari bilan → me', async () => {
    const response = await loginRequest(app, mentor).expect(200);

    expect(response.body).toEqual({
      accessToken: expect.any(String) as string,
      expiresIn: 900,
      user: {
        id: mentor.id,
        role: 'MENTOR',
        firstName: 'E2E',
        lastName: 'MENTOR',
        phone: mentor.phone,
        mustChangePassword: false,
      },
    });
    const setCookie = refreshSetCookie(response) ?? '';
    expect(setCookie).toMatch(/^rt=[\w-]{43};/);
    expect(setCookie).toContain('Path=/api/v1/auth');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Strict');

    const { accessToken } = response.body as { accessToken: string };
    const me = await http(app).get(`${API}/auth/me`).auth(accessToken, { type: 'bearer' });
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ id: mentor.id, role: 'MENTOR' });
  });

  it("noto'g'ri parol, noma'lum telefon va INACTIVE — bir xil 401", async () => {
    const inactive = await fixtures.createUser({ role: Role.MENTOR, status: UserStatus.INACTIVE });
    const unknown: TestUser = { ...mentor, phone: '+998770000000' };

    const responses = await Promise.all([
      loginRequest(app, mentor, 'NotoGri123'),
      loginRequest(app, unknown),
      loginRequest(app, inactive),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(401);
      expect(response.body).toEqual(INVALID_CREDENTIALS);
      expect(refreshSetCookie(response)).toBeUndefined();
    }
  });

  it("student login: kod katta-kichik harfdan qat'i nazar, mustChangePassword va studentCode", async () => {
    const student = await fixtures.createUser({ role: Role.STUDENT, mustChangePassword: true });

    const response = await http(app)
      .post(`${API}/auth/student/login`)
      .send({ studentCode: (student.studentCode ?? '').toLowerCase(), password: TEST_PASSWORD })
      .expect(200);

    expect(response.body).toMatchObject({
      user: { role: 'STUDENT', studentCode: student.studentCode, mustChangePassword: true },
    });
  });

  it('validatsiya xatosi — 400 details[] bilan', async () => {
    const response = await http(app)
      .post(`${API}/auth/staff/login`)
      .send({ phone: '123', password: '' })
      .expect(400);

    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it("token yo'q yoki buzilgan — 401", async () => {
    await http(app).get(`${API}/auth/me`).expect(401);
    await http(app).get(`${API}/auth/me`).auth('buzilgan', { type: 'bearer' }).expect(401);
  });

  it("@Roles: mos bo'lmagan rol — 403, mos rol — 200", async () => {
    const mentorSession = await login(app, mentor);
    const adminSession = await login(app, admin);

    const forbidden = await http(app)
      .get(`${API}/e2e-probe/admin-only`)
      .auth(mentorSession.accessToken, { type: 'bearer' })
      .expect(403);
    expect(forbidden.body).toMatchObject({ error: { code: 'FORBIDDEN' } });
    await http(app)
      .get(`${API}/e2e-probe/admin-only`)
      .auth(adminSession.accessToken, { type: 'bearer' })
      .expect(200, { ok: true });
  });

  it("rate limit: 5 ta xato urinishdan keyin 6-si — 429 (to'g'ri parol bilan ham)", async () => {
    const target = await fixtures.createUser({ role: Role.MENTOR });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await loginRequest(app, target, 'NotoGri123').expect(401);
    }
    const limited = await loginRequest(app, target).expect(429);

    expect(limited.body).toMatchObject({ error: { code: 'RATE_LIMITED' } });
  });

  it("rate limit parallel so'rovlarda ham ishlaydi: limitdan ortig'i — 429 (urinish parol tekshiruvidan oldin)", async () => {
    const target = await fixtures.createUser({ role: Role.MENTOR });
    const maxAttempts = app.get(AppConfigService).get('LOGIN_RATE_LIMIT_MAX_ATTEMPTS');

    const responses = await Promise.all(
      Array.from({ length: maxAttempts + EXTRA_ATTEMPTS }, () =>
        loginRequest(app, target, 'NotoGri123'),
      ),
    );

    expect(statusCounts(responses)).toEqual({ 401: maxAttempts, 429: EXTRA_ATTEMPTS });
  });

  it('muvaffaqiyatli kirish ip+login hisoblagichini tozalaydi', async () => {
    const target = await fixtures.createUser({ role: Role.MENTOR });
    const maxAttempts = app.get(AppConfigService).get('LOGIN_RATE_LIMIT_MAX_ATTEMPTS');

    for (let attempt = 1; attempt < maxAttempts; attempt += 1) {
      await loginRequest(app, target, 'NotoGri123').expect(401);
    }
    await loginRequest(app, target).expect(200);
    for (let attempt = 1; attempt < maxAttempts; attempt += 1) {
      await loginRequest(app, target, 'NotoGri123').expect(401);
    }
    await loginRequest(app, target).expect(200);
  });

  it("IP bo'yicha umumiy limit (password spraying): turli loginlar bilan limitdan oshganda — 429", async () => {
    const clientIp = `${TEST_NET_PREFIX}${randomInt(1, MAX_OCTET)}`;
    const redis = app.get(RedisService);
    await redis.del(`${LOGIN_IP_ATTEMPTS_KEY_PREFIX}${clientIp}`);
    const maxAttempts = app.get(AppConfigService).get('LOGIN_IP_RATE_LIMIT_MAX_ATTEMPTS');
    const spray = () =>
      http(app)
        .post(`${API}/auth/staff/login`)
        .set('X-Forwarded-For', clientIp)
        .send({ phone: randomTestPhone(), password: 'NotoGri123' });

    try {
      const responses = await Promise.all(Array.from({ length: maxAttempts + 1 }, spray));

      expect(statusCounts(responses)).toEqual({ 401: maxAttempts, 429: 1 });
    } finally {
      await redis.del(`${LOGIN_IP_ATTEMPTS_KEY_PREFIX}${clientIp}`);
    }
  });

  it("noma'lum maydon (strict sxema) — 400 VALIDATION_ERROR", async () => {
    const response = await http(app)
      .post(`${API}/auth/staff/login`)
      .send({ phone: mentor.phone, password: TEST_PASSWORD, role: 'SUPER_ADMIN' })
      .expect(400);

    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });
});
