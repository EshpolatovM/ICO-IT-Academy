import { ErrorCode, Role, UserStatus } from '@lms/shared';

import { INVALID_CREDENTIALS_MESSAGE } from '../auth.constants.js';

import { LoginService } from './login.service.js';

import type { LoginRateLimiter } from './login-rate-limiter.service.js';
import type { PasswordVerifier } from './password-verifier.service.js';
import type { SessionIssuer } from './session-issuer.service.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';
import type { UserAuthRecord } from '../../users/users.types.js';

const meta = { ip: '10.0.0.1', userAgent: 'jest' };
const refreshToken = { token: 'raw-rt', expiresAt: new Date() };

function user(overrides: Partial<UserAuthRecord> = {}): UserAuthRecord {
  return {
    id: 'u1',
    role: Role.STUDENT,
    phone: null,
    studentCode: 'ST-10001',
    passwordHash: 'hash',
    mustChangePassword: true,
    tokenVersion: 0,
    firstName: 'Ali',
    lastName: 'Valiyev',
    status: UserStatus.ACTIVE,
    ...overrides,
  };
}

function createService(found: UserAuthRecord | null, passwordMatches = true) {
  const users = {
    findStaffByPhone: jest.fn().mockResolvedValue(found),
    findStudentByCode: jest.fn().mockResolvedValue(found),
    markLoggedIn: jest.fn().mockResolvedValue(undefined),
  };
  const passwords = { verify: jest.fn().mockResolvedValue(passwordMatches) };
  const rateLimiter = {
    consume: jest.fn().mockResolvedValue(undefined),
    succeed: jest.fn().mockResolvedValue(undefined),
  };
  const sessions = {
    start: jest.fn().mockResolvedValue({ accessToken: 'jwt', expiresIn: 900, refreshToken }),
  };
  const service = new LoginService(
    users as unknown as UsersRepository,
    passwords as unknown as PasswordVerifier,
    rateLimiter as unknown as LoginRateLimiter,
    sessions as unknown as SessionIssuer,
  );
  return { users, passwords, rateLimiter, sessions, service };
}

const invalidCredentials = {
  code: ErrorCode.UNAUTHORIZED,
  status: 401,
  message: INVALID_CREDENTIALS_MESSAGE,
};

describe('LoginService', () => {
  it('student: muvaffaqiyat — javob docs/12 §1 shaklida, limiter tozalanadi, last_login yoziladi', async () => {
    const { users, rateLimiter, sessions, service } = createService(user());

    const result = await service.loginStudent({ studentCode: 'ST-10001', password: 'P' }, meta);

    expect(result).toEqual({
      body: {
        accessToken: 'jwt',
        expiresIn: 900,
        user: {
          id: 'u1',
          role: Role.STUDENT,
          firstName: 'Ali',
          lastName: 'Valiyev',
          studentCode: 'ST-10001',
          mustChangePassword: true,
        },
      },
      refreshToken,
    });
    const limiterKey = { kind: 'student', ip: '10.0.0.1', login: 'ST-10001' };
    expect(rateLimiter.consume).toHaveBeenCalledWith(limiterKey);
    expect(rateLimiter.succeed).toHaveBeenCalledWith(limiterKey);
    expect(users.markLoggedIn).toHaveBeenCalledWith('u1', expect.any(Date));
    expect(sessions.start).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }), meta);
  });

  it("staff: telefon bo'yicha qidiradi, javobda phone bor", async () => {
    const staff = user({ role: Role.MENTOR, phone: '+998900000001', studentCode: null });
    const { users, service } = createService(staff);

    const result = await service.loginStaff({ phone: '+998900000001', password: 'P' }, meta);

    expect(users.findStaffByPhone).toHaveBeenCalledWith('+998900000001');
    expect(result.body.user).toMatchObject({ role: Role.MENTOR, phone: '+998900000001' });
    expect(result.body.user).not.toHaveProperty('studentCode');
  });

  it("parol noto'g'ri — umumiy 401, urinish oldindan sanalgan va tozalanmaydi, sessiya ochilmaydi", async () => {
    const { rateLimiter, passwords, sessions, service } = createService(user(), false);

    await expect(
      service.loginStudent({ studentCode: 'ST-10001', password: 'P' }, meta),
    ).rejects.toMatchObject(invalidCredentials);
    expect(rateLimiter.consume).toHaveBeenCalledTimes(1);
    expect(rateLimiter.consume.mock.invocationCallOrder[0]).toBeLessThan(
      passwords.verify.mock.invocationCallOrder[0] ?? 0,
    );
    expect(rateLimiter.succeed).not.toHaveBeenCalled();
    expect(sessions.start).not.toHaveBeenCalled();
  });

  it('foydalanuvchi topilmasa — parol baribir tekshiriladi (timing), xuddi shu 401', async () => {
    const { passwords, service } = createService(null);

    await expect(
      service.loginStaff({ phone: '+998900000009', password: 'P' }, meta),
    ).rejects.toMatchObject(invalidCredentials);
    expect(passwords.verify).toHaveBeenCalledWith(null, 'P');
  });

  it("INACTIVE foydalanuvchi — parol to'g'ri bo'lsa ham xuddi shu 401", async () => {
    const { service } = createService(user({ status: UserStatus.INACTIVE }));

    await expect(
      service.loginStudent({ studentCode: 'ST-10001', password: 'P' }, meta),
    ).rejects.toMatchObject(invalidCredentials);
  });

  it('limit oshgan — 429, foydalanuvchi qidirilmaydi', async () => {
    const { users, rateLimiter, service } = createService(user());
    rateLimiter.consume.mockRejectedValue(
      Object.assign(new Error('limit'), { code: ErrorCode.RATE_LIMITED }),
    );

    await expect(
      service.loginStudent({ studentCode: 'ST-10001', password: 'P' }, meta),
    ).rejects.toMatchObject({ code: ErrorCode.RATE_LIMITED });
    expect(users.findStudentByCode).not.toHaveBeenCalled();
  });
});
