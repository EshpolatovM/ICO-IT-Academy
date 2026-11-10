import { Reflector } from '@nestjs/core';

import { ErrorCode, Role } from '@lms/shared';

import { PARENT_WRITE_ALLOWED_KEY } from '../decorators/parent-write-allowed.decorator.js';
import { STUDENT_SCOPE_PARAM_KEY } from '../scope/student-scope.types.js';

import { ParentReadOnlyGuard } from './parent-read-only.guard.js';
import { StudentScopeGuard } from './student-scope.guard.js';

import type { RequestUser } from '../auth/request-user.types.js';
import type { StudentScopeResolver } from '../scope/student-scope.types.js';
import type { ExecutionContext } from '@nestjs/common';

function handler(): void {
  // metadata osiladigan soxta handler
}

interface FakeRequest {
  user?: RequestUser;
  method?: string;
  params?: Record<string, string>;
}

function contextFor(
  request: FakeRequest,
  metadata: Record<string, unknown> = {},
): ExecutionContext {
  for (const [key, value] of Object.entries(metadata)) {
    Reflect.defineMetadata(key, value, handler);
  }
  return {
    getHandler: () => handler,
    getClass: () => handler,
    switchToHttp: () => ({ getRequest: () => ({ params: {}, ...request }) }),
  } as unknown as ExecutionContext;
}

const parent: RequestUser = {
  id: 't1',
  role: Role.PARENT,
  mustChangePassword: false,
  tokenIds: ['t1'],
  studentIds: ['s1'],
};
const admin: RequestUser = { id: 'a1', role: Role.ADMIN, mustChangePassword: false };

afterEach(() => {
  for (const key of Reflect.getMetadataKeys(handler)) {
    Reflect.deleteMetadata(key, handler);
  }
});

describe('ParentReadOnlyGuard', () => {
  const guard = new ParentReadOnlyGuard(new Reflector());

  it.each(['GET', 'HEAD'])("ota-ona %s — o'tkazadi", (method) => {
    expect(guard.canActivate(contextFor({ user: parent, method }))).toBe(true);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('ota-ona %s — 403', (method) => {
    expect(() => guard.canActivate(contextFor({ user: parent, method }))).toThrow(
      expect.objectContaining({ code: ErrorCode.FORBIDDEN }) as Error,
    );
  });

  it("@ParentWriteAllowed (logout, /auth/parent/*) — ota-ona POST o'tadi", () => {
    const context = contextFor(
      { user: parent, method: 'POST' },
      { [PARENT_WRITE_ALLOWED_KEY]: true },
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it("boshqa rollar va public (user yo'q) — ta'sir qilmaydi", () => {
    expect(guard.canActivate(contextFor({ user: admin, method: 'DELETE' }))).toBe(true);
    expect(guard.canActivate(contextFor({ method: 'POST' }))).toBe(true);
  });
});

describe('StudentScopeGuard', () => {
  function setup(allowed: boolean | Error) {
    const canAccess = jest.fn(() =>
      allowed instanceof Error ? Promise.reject(allowed) : Promise.resolve(allowed),
    );
    const resolver: StudentScopeResolver = { canAccess };
    return { canAccess, guard: new StudentScopeGuard(new Reflector(), resolver) };
  }
  const scoped = { [STUDENT_SCOPE_PARAM_KEY]: 'id' };

  it("resolver ruxsat bersa — o'tkazadi (URL parametridagi id bilan)", async () => {
    const { canAccess, guard } = setup(true);

    await expect(
      guard.canActivate(contextFor({ user: admin, params: { id: 's1' } }, scoped)),
    ).resolves.toBe(true);
    expect(canAccess).toHaveBeenCalledWith(admin, 's1');
  });

  it("scope'dan tashqari — 404 (mavjudligi oshkor qilinmaydi)", async () => {
    const { guard } = setup(false);

    await expect(
      guard.canActivate(contextFor({ user: parent, params: { id: 's9' } }, scoped)),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND, status: 404 });
  });

  it("resolver xatosi (masalan mentor hozircha yopiq — 403) o'zgarmay uzatiladi", async () => {
    const { guard } = setup(Object.assign(new Error('x'), { code: ErrorCode.FORBIDDEN }));

    await expect(
      guard.canActivate(contextFor({ user: admin, params: { id: 's1' } }, scoped)),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it("parametr yo'q yoki user yo'q — 403", async () => {
    const { guard } = setup(true);

    await expect(guard.canActivate(contextFor({ user: admin }, scoped))).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
    await expect(
      guard.canActivate(contextFor({ params: { id: 's1' } }, scoped)),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });
});
