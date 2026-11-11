import { Reflector } from '@nestjs/core';

import { ErrorCode, Role } from '@lms/shared';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';
import { PARENT_SESSION_COOKIE_NAME } from '../auth.constants.js';

import { JwtAuthGuard } from './jwt-auth.guard.js';

import type { AuthenticatedRequest } from '../../../common/auth/request-user.types.js';
import type { AccessTokenService } from '../services/access-token.service.js';
import type { ParentCookiesService } from '../services/parent-cookies.service.js';
import type { ParentSessionAuthenticator } from '../services/parent-session-authenticator.service.js';
import type { TokenVersionService } from '../services/token-version.service.js';
import type { ExecutionContext } from '@nestjs/common';

const payload = { sub: 'u1', role: Role.STUDENT, mcp: true, ver: 2 };
const parentUser = {
  id: 't1',
  role: Role.PARENT,
  mustChangePassword: false,
  tokenIds: ['t1'],
  studentIds: ['s1'],
};

function setup(currentVersion: number | null = 2, renewed: object | null = null) {
  const accessTokens = { verify: jest.fn().mockResolvedValue(payload) };
  const tokenVersions = { current: jest.fn().mockResolvedValue(currentVersion) };
  const parentSessions = {
    authenticate: jest.fn().mockResolvedValue({ user: parentUser, renewed }),
  };
  const parentCookies = { setSession: jest.fn() };
  const reflector = new Reflector();
  const guard = new JwtAuthGuard(
    reflector,
    accessTokens as unknown as AccessTokenService,
    tokenVersions as unknown as TokenVersionService,
    parentSessions as unknown as ParentSessionAuthenticator,
    parentCookies as unknown as ParentCookiesService,
  );
  return { reflector, accessTokens, parentSessions, parentCookies, guard };
}

function httpContext(authorization?: string, cookies: Record<string, string> = {}) {
  const request = { get: () => authorization, cookies } as unknown as AuthenticatedRequest;
  const response = {};
  const context = {
    getHandler: () => httpContext,
    getClass: () => JwtAuthGuard,
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ExecutionContext;
  return { request, response, context };
}

describe('JwtAuthGuard', () => {
  it('@Public — token tekshirilmaydi', async () => {
    const { reflector, accessTokens, guard } = setup();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => key === IS_PUBLIC_KEY);

    await expect(guard.canActivate(httpContext().context)).resolves.toBe(true);
    expect(accessTokens.verify).not.toHaveBeenCalled();
  });

  it.each([undefined, 'Basic abc', 'Bearer'])(
    "sarlavha %s va ps cookie yo'q — 401",
    async (header) => {
      const { guard } = setup();

      await expect(guard.canActivate(httpContext(header).context)).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      });
    },
  );

  it("to'g'ri token va ver mos — request.user qo'yiladi", async () => {
    const { accessTokens, guard } = setup();
    const { request, context } = httpContext('Bearer abc.def.ghi');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(accessTokens.verify).toHaveBeenCalledWith('abc.def.ghi');
    expect(request.user).toEqual({ id: 'u1', role: Role.STUDENT, mustChangePassword: true });
  });

  it.each([
    ['ver oshgan (parol tiklangan)', 3],
    ["foydalanuvchi o'chirilgan", null],
  ])('%s — 401', async (_label, version) => {
    const { guard } = setup(version);

    await expect(guard.canActivate(httpContext('Bearer t').context)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

  it("Bearer yo'q, ps cookie bor — ota-ona sessiyasi (yangilash kerak emas)", async () => {
    const { parentSessions, parentCookies, guard } = setup();
    const { request, context } = httpContext(undefined, { [PARENT_SESSION_COOKIE_NAME]: 'ps.jwt' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(parentSessions.authenticate).toHaveBeenCalledWith('ps.jwt');
    expect(request.user).toEqual(parentUser);
    expect(parentCookies.setSession).not.toHaveBeenCalled();
  });

  it('ota-ona sessiyasi yangilansa (sliding) — ps cookie qayta yoziladi', async () => {
    const renewed = { token: 'new', expiresAt: new Date() };
    const { parentCookies, guard } = setup(2, renewed);
    const { response, context } = httpContext(undefined, {
      [PARENT_SESSION_COOKIE_NAME]: 'ps.jwt',
    });

    await guard.canActivate(context);
    expect(parentCookies.setSession).toHaveBeenCalledWith(response, renewed);
  });

  it("Bearer bor bo'lsa ps cookie e'tiborga olinmaydi", async () => {
    const { parentSessions, guard } = setup();
    const { context } = httpContext('Bearer t', { [PARENT_SESSION_COOKIE_NAME]: 'ps.jwt' });

    await guard.canActivate(context);
    expect(parentSessions.authenticate).not.toHaveBeenCalled();
  });
});
