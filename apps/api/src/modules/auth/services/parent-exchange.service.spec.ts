import { ErrorCode } from '@lms/shared';

import { ParentExchangeService } from './parent-exchange.service.js';

import type { ParentCookiesService } from './parent-cookies.service.js';
import type { ParentExchangeRateLimiter } from './parent-exchange-rate-limiter.service.js';
import type { ParentSessionTokenService } from './parent-session-token.service.js';
import type { ParentGrantsService } from '../../parent-access/services/parent-grants.service.js';
import type { ParentExchangeDto } from '../dto/auth.dto.js';
import type { Response } from 'express';

/** Amaldagi tokenlar: A → s1, B → s2, C → s1 (bir farzandga ikkinchi token). */
const VALID: Record<string, { tokenId: string; studentId: string }> = {
  A: { tokenId: 'tA', studentId: 's1' },
  B: { tokenId: 'tB', studentId: 's2' },
  C: { tokenId: 'tC', studentId: 's1' },
};
const NAMES: Record<string, string> = { s1: 'Ali', s2: 'Vali' };
const session = { token: 'ps-jwt', expiresAt: new Date() };
const meta = { ip: '10.0.0.1', userAgent: 'jest' };

function setup(stored: string[] = []) {
  const grants = {
    findByRawTokens: jest.fn((tokens: string[]) =>
      Promise.resolve(
        tokens.flatMap((token) => {
          const grant = VALID[token];
          return grant
            ? [{ ...grant, token, firstName: NAMES[grant.studentId] ?? '', lastName: 'X' }]
            : [];
        }),
      ),
    ),
    recordExchange: jest.fn().mockResolvedValue(undefined),
  };
  const sessionTokens = { sign: jest.fn().mockResolvedValue(session) };
  const cookies = {
    decodeStoredTokens: jest.fn().mockReturnValue(stored),
    setSession: jest.fn(),
    setStoredTokens: jest.fn(),
    clearAll: jest.fn(),
  };
  const rateLimiter = {
    consumeAttempt: jest.fn().mockResolvedValue(undefined),
    registerFailure: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ParentExchangeService(
    grants as unknown as ParentGrantsService,
    sessionTokens as unknown as ParentSessionTokenService,
    cookies as unknown as ParentCookiesService,
    rateLimiter as unknown as ParentExchangeRateLimiter,
  );
  const response = {} as Response;
  const run = (dto: Partial<ParentExchangeDto>) =>
    service.exchange({
      dto: { merge: false, ...dto },
      storedCookie: 'enc',
      meta,
      response,
    });
  return { run, grants, sessionTokens, cookies, rateLimiter, response };
}

describe('ParentExchangeService', () => {
  it('tokens (merge=false): faqat berilganlar; sessiya, cookie, qayd va farzandlar', async () => {
    const { run, grants, sessionTokens, cookies, rateLimiter, response } = setup(['B']);

    await expect(run({ tokens: ['A'] })).resolves.toEqual({
      children: [{ studentId: 's1', firstName: 'Ali', lastName: 'X', groupName: null }],
    });
    expect(rateLimiter.consumeAttempt).toHaveBeenCalledWith('10.0.0.1');
    expect(cookies.decodeStoredTokens).not.toHaveBeenCalled();
    expect(grants.recordExchange).toHaveBeenCalledWith(
      [expect.objectContaining({ tokenId: 'tA' })],
      meta,
    );
    expect(sessionTokens.sign).toHaveBeenCalledWith([expect.objectContaining({ tokenId: 'tA' })]);
    expect(cookies.setSession).toHaveBeenCalledWith(response, session);
    expect(cookies.setStoredTokens).toHaveBeenCalledWith(response, ['A']);
  });

  it("merge=true: cookie'dagilarga qo'shiladi, takrorlanmaydi, farzandlar birlashadi", async () => {
    const { run, cookies } = setup(['A', 'C']);

    const result = await run({ tokens: ['B', 'A'], merge: true });

    expect(cookies.decodeStoredTokens).toHaveBeenCalledWith('enc');
    expect(cookies.setStoredTokens).toHaveBeenCalledWith(expect.anything(), ['C', 'B', 'A']);
    expect(result.children.map((child) => child.studentId)).toEqual(['s1', 's2']);
  });

  it("body'siz: cookie'dagi tokenlar bilan yangilanadi, bekor qilinganlari cookie'dan chiqadi", async () => {
    const { run, cookies, rateLimiter } = setup(['A', 'REVOKED', 'B']);

    await run({});

    expect(cookies.setStoredTokens).toHaveBeenCalledWith(expect.anything(), ['A', 'B']);
    expect(rateLimiter.registerFailure).not.toHaveBeenCalled();
  });

  it("body'siz va amaldagi token yo'q — 401, ikkala cookie o'chiriladi, xato sanaladi", async () => {
    const { run, cookies, rateLimiter, response } = setup(['REVOKED']);

    await expect(run({})).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED, status: 401 });
    expect(cookies.clearAll).toHaveBeenCalledWith(response);
    expect(rateLimiter.registerFailure).toHaveBeenCalledWith('10.0.0.1');
    expect(cookies.setSession).not.toHaveBeenCalled();
  });

  it("berilgan token yaroqsiz (merge bilan ham) — 401, mavjud cookie'larga tegilmaydi", async () => {
    const { run, cookies, rateLimiter, grants } = setup(['A']);

    await expect(run({ tokens: ['WRONG'], merge: true })).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(cookies.clearAll).not.toHaveBeenCalled();
    expect(cookies.setStoredTokens).not.toHaveBeenCalled();
    expect(grants.recordExchange).not.toHaveBeenCalled();
    expect(rateLimiter.registerFailure).toHaveBeenCalled();
  });

  it("rate limit — 429 bo'lsa token tekshirilmaydi", async () => {
    const { run, rateLimiter, grants } = setup();
    rateLimiter.consumeAttempt.mockRejectedValue(
      Object.assign(new Error('rl'), { code: ErrorCode.RATE_LIMITED }),
    );

    await expect(run({ tokens: ['A'] })).rejects.toMatchObject({ code: ErrorCode.RATE_LIMITED });
    expect(grants.findByRawTokens).not.toHaveBeenCalled();
  });
});
