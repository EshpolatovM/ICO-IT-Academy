import { Reflector } from '@nestjs/core';

import { ErrorCode, Role } from '@lms/shared';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';

import { JwtAuthGuard } from './jwt-auth.guard.js';

import type { AuthenticatedRequest } from '../../../common/auth/request-user.types.js';
import type { AccessTokenService } from '../services/access-token.service.js';
import type { TokenVersionService } from '../services/token-version.service.js';
import type { ExecutionContext } from '@nestjs/common';

const payload = { sub: 'u1', role: Role.STUDENT, mcp: true, ver: 2 };

function setup(currentVersion: number | null = 2) {
  const accessTokens = { verify: jest.fn().mockResolvedValue(payload) };
  const tokenVersions = { current: jest.fn().mockResolvedValue(currentVersion) };
  const reflector = new Reflector();
  const guard = new JwtAuthGuard(
    reflector,
    accessTokens as unknown as AccessTokenService,
    tokenVersions as unknown as TokenVersionService,
  );
  return { reflector, accessTokens, guard };
}

function httpContext(authorization?: string) {
  const request = { get: () => authorization } as unknown as AuthenticatedRequest;
  const context = {
    getHandler: () => httpContext,
    getClass: () => JwtAuthGuard,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { request, context };
}

describe('JwtAuthGuard', () => {
  it('@Public — token tekshirilmaydi', async () => {
    const { reflector, accessTokens, guard } = setup();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => key === IS_PUBLIC_KEY);

    await expect(guard.canActivate(httpContext().context)).resolves.toBe(true);
    expect(accessTokens.verify).not.toHaveBeenCalled();
  });

  it.each([undefined, 'Basic abc', 'Bearer'])('sarlavha %s — 401', async (header) => {
    const { guard } = setup();

    await expect(guard.canActivate(httpContext(header).context)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

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
});
