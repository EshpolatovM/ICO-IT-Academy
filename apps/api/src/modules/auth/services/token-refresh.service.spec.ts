import { ErrorCode, Role, UserStatus } from '@lms/shared';

import { TokenRefreshService } from './token-refresh.service.js';

import type { AccessTokenService } from './access-token.service.js';
import type { RefreshTokenService } from './refresh-token.service.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';

const meta = { ip: null, userAgent: null };
const current = { id: 'rt-1', userId: 'u1', familyId: 'fam-1' };
const activeUser = { id: 'u1', role: Role.ADMIN, status: UserStatus.ACTIVE, tokenVersion: 2 };
const next = { token: 'new-raw', expiresAt: new Date() };

function createService(found: object | null = activeUser) {
  const users = { findAuthById: jest.fn().mockResolvedValue(found) };
  const accessTokens = {
    sign: jest.fn().mockResolvedValue({ accessToken: 'jwt', expiresIn: 900 }),
  };
  const refreshTokens = {
    findActive: jest.fn().mockResolvedValue(current),
    rotate: jest.fn().mockResolvedValue(next),
    revokeFamily: jest.fn().mockResolvedValue(1),
  };
  const service = new TokenRefreshService(
    users as unknown as UsersRepository,
    accessTokens as unknown as AccessTokenService,
    refreshTokens as unknown as RefreshTokenService,
  );
  return { accessTokens, refreshTokens, service };
}

describe('TokenRefreshService', () => {
  it("cookie yo'q — 401", async () => {
    const { refreshTokens, service } = createService();

    await expect(service.refresh(undefined, meta)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(refreshTokens.findActive).not.toHaveBeenCalled();
  });

  it('rotation: yangi refresh + joriy token_version bilan access', async () => {
    const { accessTokens, refreshTokens, service } = createService();

    const result = await service.refresh('raw', meta);

    expect(result).toEqual({ body: { accessToken: 'jwt', expiresIn: 900 }, refreshToken: next });
    expect(refreshTokens.rotate).toHaveBeenCalledWith(
      current,
      { userId: 'u1', role: Role.ADMIN },
      meta,
    );
    expect(accessTokens.sign).toHaveBeenCalledWith(activeUser);
  });

  it.each([
    ['INACTIVE', { ...activeUser, status: UserStatus.INACTIVE }],
    ["o'chirilgan", null],
  ])('foydalanuvchi %s — oila bekor va 401', async (_label, found) => {
    const { refreshTokens, service } = createService(found);

    await expect(service.refresh('raw', meta)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(refreshTokens.revokeFamily).toHaveBeenCalledWith('fam-1');
    expect(refreshTokens.rotate).not.toHaveBeenCalled();
  });
});
