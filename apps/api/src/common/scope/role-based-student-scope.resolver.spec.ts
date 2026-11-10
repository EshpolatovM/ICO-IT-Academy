import { ErrorCode, Role } from '@lms/shared';

import { RoleBasedStudentScopeResolver } from './role-based-student-scope.resolver.js';

import type { RequestUser } from '../auth/request-user.types.js';

const resolver = new RoleBasedStudentScopeResolver();

function account(
  role: typeof Role.SUPER_ADMIN | typeof Role.ADMIN | typeof Role.MENTOR | typeof Role.STUDENT,
  id = 'u1',
): RequestUser {
  return { id, role, mustChangePassword: false };
}

describe('RoleBasedStudentScopeResolver', () => {
  it.each([Role.SUPER_ADMIN, Role.ADMIN] as const)('%s — istalgan student', async (role) => {
    await expect(resolver.canAccess(account(role), 's1')).resolves.toBe(true);
  });

  it("STUDENT — faqat o'zi", async () => {
    await expect(resolver.canAccess(account(Role.STUDENT, 's1'), 's1')).resolves.toBe(true);
    await expect(resolver.canAccess(account(Role.STUDENT, 's1'), 's2')).resolves.toBe(false);
  });

  it('PARENT — faqat sessiyadagi farzandlar', async () => {
    const parent: RequestUser = {
      id: 't1',
      role: Role.PARENT,
      mustChangePassword: false,
      tokenIds: ['t1', 't2'],
      studentIds: ['s1', 's2'],
    };

    await expect(resolver.canAccess(parent, 's2')).resolves.toBe(true);
    await expect(resolver.canAccess(parent, 's3')).resolves.toBe(false);
  });

  it('MENTOR — guruhlar 2-bosqichgacha yopiq: 403', async () => {
    await expect(resolver.canAccess(account(Role.MENTOR), 's1')).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
      status: 403,
    });
  });
});
