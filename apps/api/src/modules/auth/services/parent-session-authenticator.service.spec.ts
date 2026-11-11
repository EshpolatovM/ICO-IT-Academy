import { ErrorCode, Role } from '@lms/shared';

import { ParentSessionAuthenticator } from './parent-session-authenticator.service.js';

import type { ParentSessionTokenService } from './parent-session-token.service.js';
import type { ParentGrantsService } from '../../parent-access/services/parent-grants.service.js';

const payload = {
  sub: 't1',
  role: Role.PARENT,
  tokenIds: ['t1', 't2'],
  studentIds: ['s1', 's2'],
  exp: 0,
};

function setup(active: Array<[string, string]>, renew = false) {
  const renewed = { token: 'new', expiresAt: new Date() };
  const sessionTokens = {
    verify: jest.fn().mockResolvedValue(payload),
    shouldRenew: jest.fn().mockReturnValue(renew),
    sign: jest.fn().mockResolvedValue(renewed),
  };
  const grants = { activeStudentsByTokenIds: jest.fn().mockResolvedValue(new Map(active)) };
  const authenticator = new ParentSessionAuthenticator(
    sessionTokens as unknown as ParentSessionTokenService,
    grants as unknown as ParentGrantsService,
  );
  return { authenticator, sessionTokens, renewed };
}

describe('ParentSessionAuthenticator', () => {
  it('barcha tokenlar amalda — PARENT user, yangilash kerak emas', async () => {
    const { authenticator } = setup([
      ['t1', 's1'],
      ['t2', 's2'],
    ]);

    await expect(authenticator.authenticate('jwt')).resolves.toEqual({
      user: {
        id: 't1',
        role: Role.PARENT,
        mustChangePassword: false,
        tokenIds: ['t1', 't2'],
        studentIds: ['s1', 's2'],
      },
      renewed: null,
    });
  });

  it('bitta token bekor qilingan — shu farzand sessiyadan chiqadi, boshqasi ishlaydi', async () => {
    const { authenticator } = setup([['t2', 's2']]);

    const { user } = await authenticator.authenticate('jwt');
    expect(user.tokenIds).toEqual(['t2']);
    expect(user.studentIds).toEqual(['s2']);
    expect(user.id).toBe('t2');
  });

  it('hamma tokenlar bekor qilingan — 401', async () => {
    const { authenticator } = setup([]);

    await expect(authenticator.authenticate('jwt')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

  it("token boshqa studentga bog'langan bo'lib chiqsa (soxta juftlik) — hisobga olinmaydi", async () => {
    const { authenticator } = setup([
      ['t1', 's9'],
      ['t2', 's2'],
    ]);

    const { user } = await authenticator.authenticate('jwt');
    expect(user.studentIds).toEqual(['s2']);
  });

  it('sliding: muddat yarmidan oshgan — faqat amaldagi tokenlar bilan qayta imzolanadi', async () => {
    const { authenticator, sessionTokens, renewed } = setup([['t1', 's1']], true);

    await expect(authenticator.authenticate('jwt')).resolves.toMatchObject({ renewed });
    expect(sessionTokens.sign).toHaveBeenCalledWith([{ tokenId: 't1', studentId: 's1' }]);
  });
});
