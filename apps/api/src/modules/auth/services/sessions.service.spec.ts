import { ErrorCode } from '@lms/shared';

import { SessionsService } from './sessions.service.js';

import type { RefreshTokenService } from './refresh-token.service.js';

const createdAt = new Date('2026-11-10T08:00:00Z');
const expiresAt = new Date('2026-12-10T08:00:00Z');

function token(familyId: string) {
  return {
    id: `rt-${familyId}`,
    userId: 'u1',
    familyId,
    userAgent: 'UA',
    ip: '1.1.1.1',
    createdAt,
    expiresAt,
  };
}

function createService(currentFamily: string | null = 'fam-1') {
  const refreshTokens = {
    findActiveByUser: jest.fn().mockResolvedValue([token('fam-1'), token('fam-2')]),
    findFamilyId: jest.fn().mockResolvedValue(currentFamily),
    revokeFamily: jest.fn().mockResolvedValue(1),
  };
  const service = new SessionsService(refreshTokens as unknown as RefreshTokenService);
  return { refreshTokens, service };
}

describe('SessionsService', () => {
  it("ro'yxat: id = oila, joriy qurilma belgilanadi", async () => {
    const { service } = createService();

    const { items } = await service.list('u1', 'raw');

    expect(items).toEqual([
      {
        id: 'fam-1',
        userAgent: 'UA',
        ip: '1.1.1.1',
        lastActiveAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        current: true,
      },
      expect.objectContaining({ id: 'fam-2', current: false }),
    ]);
  });

  it("cookie yo'q — hech biri joriy emas", async () => {
    const { refreshTokens, service } = createService();

    const { items } = await service.list('u1', undefined);

    expect(items.every((item) => !item.current)).toBe(true);
    expect(refreshTokens.findFamilyId).not.toHaveBeenCalled();
  });

  it("revoke: faqat o'z sessiyasi; topilmasa — 404", async () => {
    const { refreshTokens, service } = createService();

    await service.revoke('u1', 'fam-2');
    expect(refreshTokens.revokeFamily).toHaveBeenCalledWith('fam-2', 'u1');

    refreshTokens.revokeFamily.mockResolvedValue(0);
    await expect(service.revoke('u1', 'begona')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it("logout: joriy oilani bekor qiladi; cookie yoki egalik bo'lmasa — hech narsa", async () => {
    const own = createService('fam-1');
    const foreign = createService(null);

    await own.service.logout('u1', 'raw');
    await foreign.service.logout('u1', 'raw');
    await foreign.service.logout('u1', undefined);

    expect(own.refreshTokens.revokeFamily).toHaveBeenCalledWith('fam-1', 'u1');
    expect(foreign.refreshTokens.revokeFamily).not.toHaveBeenCalled();
  });
});
