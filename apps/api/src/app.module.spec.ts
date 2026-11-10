import { Test } from '@nestjs/testing';

import { Role } from '@lms/shared';

import { AppModule } from './app.module.js';
import { STAFF_ROLES } from './common/constants/roles.constants.js';

/** Kompilyatsiya uchun soxta, lekin to'g'ri formatdagi env (ulanish `init` da bo'ladi, bu yerda emas). */
const TEST_ENV = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5433/db',
  REDIS_URL: 'redis://localhost:6379/0',
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
    process.env = { ...originalEnv, DATABASE_URL: '', REDIS_URL: TEST_ENV.REDIS_URL };

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
