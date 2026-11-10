import { Reflector } from '@nestjs/core';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, ErrorCode, Role } from '@lms/shared';

import { ALLOW_PENDING_PASSWORD_CHANGE_KEY } from '../decorators/allow-pending-password-change.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

import { CsrfHeaderGuard } from './csrf-header.guard.js';
import { PasswordChangeRequiredGuard } from './password-change-required.guard.js';
import { RolesGuard } from './roles.guard.js';

import type { RequestUser } from '../auth/request-user.types.js';
import type { ExecutionContext } from '@nestjs/common';

/** Metadata osiladigan soxta handler. */
function handler(): void {
  // bo'sh
}

interface FakeRequest {
  user?: RequestUser;
  headers?: Record<string, string>;
}

function contextFor(
  request: FakeRequest,
  metadata: Record<string, unknown> = {},
): ExecutionContext {
  for (const [key, value] of Object.entries(metadata)) {
    Reflect.defineMetadata(key, value, handler);
  }
  const req = {
    ...request,
    get: (name: string) => request.headers?.[name.toLowerCase()],
  };
  return {
    getHandler: () => handler,
    getClass: () => handler,
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

function thrownBy(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}

const student: RequestUser = { id: 'u1', role: Role.STUDENT, mustChangePassword: false };

afterEach(() => {
  for (const key of Reflect.getMetadataKeys(handler)) {
    Reflect.deleteMetadata(key, handler);
  }
});

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it("@Roles berilmagan bo'lsa — o'tkazadi", () => {
    expect(guard.canActivate(contextFor({ user: student }))).toBe(true);
  });

  it("rol ro'yxatda bo'lsa — o'tkazadi", () => {
    const context = contextFor({ user: student }, { [ROLES_KEY]: [Role.STUDENT, Role.ADMIN] });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("rol ro'yxatda bo'lmasa yoki user yo'q bo'lsa — 403 FORBIDDEN", () => {
    const roles = { [ROLES_KEY]: [Role.ADMIN] };

    expect(thrownBy(() => guard.canActivate(contextFor({ user: student }, roles)))).toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
    expect(thrownBy(() => guard.canActivate(contextFor({}, roles)))).toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
  });
});

describe('PasswordChangeRequiredGuard', () => {
  const guard = new PasswordChangeRequiredGuard(new Reflector());
  const pending: RequestUser = { ...student, mustChangePassword: true };

  it("mcp=false yoki public (user yo'q) — o'tkazadi", () => {
    expect(guard.canActivate(contextFor({ user: student }))).toBe(true);
    expect(guard.canActivate(contextFor({}))).toBe(true);
  });

  it('mcp=true va endpoint ruxsat etilmagan — 403 PASSWORD_CHANGE_REQUIRED', () => {
    expect(thrownBy(() => guard.canActivate(contextFor({ user: pending })))).toMatchObject({
      code: ErrorCode.PASSWORD_CHANGE_REQUIRED,
      status: 403,
    });
  });

  it("mcp=true, lekin @AllowPendingPasswordChange — o'tkazadi", () => {
    const context = contextFor({ user: pending }, { [ALLOW_PENDING_PASSWORD_CHANGE_KEY]: true });

    expect(guard.canActivate(context)).toBe(true);
  });
});

describe('CsrfHeaderGuard', () => {
  const guard = new CsrfHeaderGuard();
  const headerKey = CSRF_HEADER_NAME.toLowerCase();

  it("to'g'ri sarlavha bilan o'tkazadi", () => {
    const context = contextFor({ headers: { [headerKey]: CSRF_HEADER_VALUE } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("sarlavha yo'q yoki boshqa qiymat — 403", () => {
    expect(thrownBy(() => guard.canActivate(contextFor({ headers: {} })))).toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
    expect(
      thrownBy(() => guard.canActivate(contextFor({ headers: { [headerKey]: 'fetch' } }))),
    ).toMatchObject({ code: ErrorCode.FORBIDDEN });
  });
});
