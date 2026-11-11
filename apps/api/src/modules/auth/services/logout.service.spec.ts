import { Role } from '@lms/shared';

import { LogoutService } from './logout.service.js';

import type { ParentCookiesService } from './parent-cookies.service.js';
import type { RefreshCookieService } from './refresh-cookie.service.js';
import type { SessionsService } from './sessions.service.js';
import type { Response } from 'express';

function setup() {
  const sessions = { logout: jest.fn().mockResolvedValue(undefined) };
  const refreshCookie = { clear: jest.fn() };
  const parentCookies = { clearAll: jest.fn() };
  const service = new LogoutService(
    sessions as unknown as SessionsService,
    refreshCookie as unknown as RefreshCookieService,
    parentCookies as unknown as ParentCookiesService,
  );
  return { service, sessions, refreshCookie, parentCookies, response: {} as Response };
}

describe('LogoutService', () => {
  it("akkaunt — joriy refresh sessiya bekor, rt o'chiriladi", async () => {
    const { service, sessions, refreshCookie, parentCookies, response } = setup();

    await service.logout(
      { id: 'u1', role: Role.STUDENT, mustChangePassword: false },
      'rt',
      response,
    );

    expect(sessions.logout).toHaveBeenCalledWith('u1', 'rt');
    expect(refreshCookie.clear).toHaveBeenCalledWith(response);
    expect(parentCookies.clearAll).not.toHaveBeenCalled();
  });

  it("ota-ona — ikkala cookie o'chiriladi, refresh sessiyalarga tegilmaydi", async () => {
    const { service, sessions, parentCookies, response } = setup();
    const parent = {
      id: 't1',
      role: Role.PARENT,
      mustChangePassword: false,
      tokenIds: ['t1'],
      studentIds: ['s1'],
    } as const;

    await service.logout(parent, undefined, response);

    expect(parentCookies.clearAll).toHaveBeenCalledWith(response);
    expect(sessions.logout).not.toHaveBeenCalled();
  });
});
