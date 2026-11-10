import { ErrorCode, Role } from '@lms/shared';

import { PasswordChangeService } from './password-change.service.js';

import type { PasswordVerifier } from './password-verifier.service.js';
import type { SessionIssuer } from './session-issuer.service.js';
import type { TokenVersionService } from './token-version.service.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';

const meta = { ip: '127.0.0.1', userAgent: 'jest' };
const dto = { oldPassword: 'Temp1234', newPassword: 'Yangi$Parol9' };
const refreshToken = { token: 'raw', expiresAt: new Date() };

function createService(oldMatches = true) {
  const users = {
    findAuthById: jest.fn().mockResolvedValue({
      id: 'u1',
      role: Role.STUDENT,
      passwordHash: 'old-hash',
      mustChangePassword: true,
      tokenVersion: 0,
    }),
    changePassword: jest.fn().mockResolvedValue({ tokenVersion: 1 }),
  };
  const passwords = {
    verify: jest.fn().mockResolvedValue(oldMatches),
    hash: jest.fn().mockResolvedValue('new-hash'),
  };
  const tokenVersions = { remember: jest.fn().mockResolvedValue(undefined) };
  const sessions = {
    start: jest.fn().mockResolvedValue({ accessToken: 'jwt', expiresIn: 900, refreshToken }),
  };
  const service = new PasswordChangeService(
    users as unknown as UsersRepository,
    passwords as unknown as PasswordVerifier,
    tokenVersions as unknown as TokenVersionService,
    sessions as unknown as SessionIssuer,
  );
  return { users, tokenVersions, sessions, service };
}

describe('PasswordChangeService', () => {
  it('oqim: hash → atomar yangilash (ver++, sessiyalar bekor) → kesh → yangi sessiya mcp=false', async () => {
    const { users, tokenVersions, sessions, service } = createService();

    const result = await service.change('u1', dto, meta);

    expect(users.changePassword).toHaveBeenCalledWith('u1', {
      passwordHash: 'new-hash',
      revokedAt: expect.any(Date) as Date,
    });
    expect(tokenVersions.remember).toHaveBeenCalledWith('u1', 1);
    expect(sessions.start).toHaveBeenCalledWith(
      { id: 'u1', role: Role.STUDENT, mustChangePassword: false, tokenVersion: 1 },
      meta,
    );
    expect(result).toEqual({ body: { accessToken: 'jwt', expiresIn: 900 }, refreshToken });
  });

  it("eski parol noto'g'ri — 400 (oldPassword maydoni), hech narsa o'zgarmaydi", async () => {
    const { users, service } = createService(false);

    await expect(service.change('u1', dto, meta)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      status: 400,
      details: [expect.objectContaining({ field: 'oldPassword' })],
    });
    expect(users.changePassword).not.toHaveBeenCalled();
  });

  it('foydalanuvchi topilmasa — 401', async () => {
    const { users, service } = createService();
    users.findAuthById.mockResolvedValue(null);

    await expect(service.change('u1', dto, meta)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });
});
