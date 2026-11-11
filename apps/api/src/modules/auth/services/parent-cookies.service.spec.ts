import { randomBytes } from 'node:crypto';

import { PARENT_SESSION_COOKIE_NAME, PARENT_TOKENS_COOKIE_NAME } from '../auth.constants.js';

import { ParentCookiesService } from './parent-cookies.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { Response } from 'express';

const TOKEN_A = 'A'.repeat(43);
const TOKEN_B = 'b_-'.repeat(14) + 'c';

function setup(key = randomBytes(32).toString('base64')) {
  const settings: Record<string, unknown> = {
    PARENT_COOKIE_KEY: key,
    COOKIE_SECURE: true,
    PARENT_TOKENS_COOKIE_MAX_AGE_SECONDS: 15_552_000,
  };
  const config = { get: (name: string) => settings[name] } as unknown as AppConfigService;
  const response = { cookie: jest.fn(), clearCookie: jest.fn() };
  return {
    service: new ParentCookiesService(config),
    response,
    res: response as unknown as Response,
  };
}

function storedValue(response: { cookie: jest.Mock }): string {
  const call = response.cookie.mock.calls.find(([name]) => name === PARENT_TOKENS_COOKIE_NAME) as
    [string, string] | undefined;
  return call?.[1] ?? '';
}

describe('ParentCookiesService', () => {
  it("parent_tokens: shifrlangan (xom token ko'rinmaydi), HttpOnly/Strict/Secure, Path va Max-Age", () => {
    const { service, response, res } = setup();

    service.setStoredTokens(res, [TOKEN_A, TOKEN_B]);

    const value = storedValue(response);
    expect(value).not.toContain(TOKEN_A);
    expect(response.cookie).toHaveBeenCalledWith(PARENT_TOKENS_COOKIE_NAME, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/auth/parent',
      maxAge: 15_552_000_000,
    });
    expect(service.decodeStoredTokens(value)).toEqual([TOKEN_A, TOKEN_B]);
  });

  it("buzilgan, boshqa kalitli yoki yo'q cookie — bo'sh ro'yxat (rad etiladi)", () => {
    const { service, response, res } = setup();
    service.setStoredTokens(res, [TOKEN_A]);
    const value = storedValue(response);
    const tampered = `${value.slice(0, -2)}${value.endsWith('AA') ? 'BB' : 'AA'}`;

    expect(service.decodeStoredTokens(tampered)).toEqual([]);
    expect(setup().service.decodeStoredTokens(value)).toEqual([]);
    expect(service.decodeStoredTokens(undefined)).toEqual([]);
    expect(service.decodeStoredTokens('oddiy-matn')).toEqual([]);
  });

  it("ps: muddati sessiya bilan, Path=/api/v1; chiqishda ikkala cookie o'chiriladi", () => {
    const { service, response, res } = setup();
    const expiresAt = new Date('2026-11-10T20:00:00Z');

    service.setSession(res, { token: 'jwt', expiresAt });
    service.clearAll(res);

    expect(response.cookie).toHaveBeenCalledWith(PARENT_SESSION_COOKIE_NAME, 'jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1',
      expires: expiresAt,
    });
    expect(response.clearCookie).toHaveBeenCalledWith(
      PARENT_SESSION_COOKIE_NAME,
      expect.objectContaining({ path: '/api/v1' }),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      PARENT_TOKENS_COOKIE_NAME,
      expect.objectContaining({ path: '/api/v1/auth/parent' }),
    );
  });
});
