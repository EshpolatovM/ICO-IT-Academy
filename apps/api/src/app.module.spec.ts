import { Test } from '@nestjs/testing';

import { Role } from '@lms/shared';

import { AppModule } from './app.module.js';
import { STAFF_ROLES } from './common/constants/roles.constants.js';

/** Kompilyatsiya uchun soxta, lekin to'g'ri formatdagi env (ulanish `init` da bo'ladi, bu yerda emas). */
const TEST_ENV = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5433/db',
  REDIS_URL: 'redis://localhost:6379/0',
  JWT_ACCESS_SECRET: 'test-secret-'.padEnd(32, 'x'),
  JWT_ACCESS_TTL_SECONDS: '900',
  REFRESH_TTL_STUDENT_SECONDS: '2592000',
  REFRESH_TTL_STAFF_SECONDS: '604800',
  COOKIE_SECURE: 'false',
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: '5',
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: '900',
  WEB_BASE_URL: 'http://localhost:3000',
  PARENT_TOKEN_PEPPER: 'test-pepper-'.padEnd(32, 'x'),
  PARENT_COOKIE_KEY: Buffer.alloc(32, 1).toString('base64'),
  PARENT_SESSION_TTL_SECONDS: '43200',
  PARENT_TOKENS_COOKIE_MAX_AGE_SECONDS: '15552000',
  PARENT_MAX_ACTIVE_TOKENS: '3',
  PARENT_EXCHANGE_MAX_ATTEMPTS: '10',
  PARENT_EXCHANGE_WINDOW_SECONDS: '900',
  PARENT_EXCHANGE_MAX_FAILURES: '20',
  PARENT_EXCHANGE_BLOCK_SECONDS: '3600',
};

describe('AppModule (smoke)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...TEST_ENV };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('modul xatosiz kompilyatsiya qilinadi', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule);
    await moduleRef.close();
  });

  it("noto'g'ri env bilan modul ishga tushmaydi", async () => {
    process.env = { ...originalEnv, ...TEST_ENV, DATABASE_URL: '' };

    await expect(Test.createTestingModule({ imports: [AppModule] }).compile()).rejects.toThrow(
      /DATABASE_URL/,
    );
  });

  it("xodim rollari @lms/shared dagi Role'dan olinadi va student/ota-onani o'z ichiga olmaydi", () => {
    expect(STAFF_ROLES).toEqual([Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR]);
    expect(STAFF_ROLES).not.toContain(Role.STUDENT);
    expect(STAFF_ROLES).not.toContain(Role.PARENT);
  });
});
