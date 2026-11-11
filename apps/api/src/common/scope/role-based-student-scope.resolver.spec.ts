import { Role } from '@lms/shared';

import { RoleBasedStudentScopeResolver } from './role-based-student-scope.resolver.js';

import type { RequestUser } from '../auth/request-user.types.js';

function setup(isMentorOf = true) {
  const mentorScope = { isMentorOf: jest.fn().mockResolvedValue(isMentorOf) };
  const resolver = new RoleBasedStudentScopeResolver(mentorScope);
  return { resolver, mentorScope };
}

function account(
  role: typeof Role.SUPER_ADMIN | typeof Role.ADMIN | typeof Role.MENTOR | typeof Role.STUDENT,
  id = 'u1',
): RequestUser {
  return { id, role, mustChangePassword: false };
}

describe('RoleBasedStudentScopeResolver', () => {
  it.each([Role.SUPER_ADMIN, Role.ADMIN] as const)('%s — istalgan student', async (role) => {
    const { resolver, mentorScope } = setup();

    await expect(resolver.canAccess(account(role), 's1')).resolves.toBe(true);
    expect(mentorScope.isMentorOf).not.toHaveBeenCalled();
  });

  it("STUDENT — faqat o'zi", async () => {
    const { resolver } = setup();

    await expect(resolver.canAccess(account(Role.STUDENT, 's1'), 's1')).resolves.toBe(true);
    await expect(resolver.canAccess(account(Role.STUDENT, 's1'), 's2')).resolves.toBe(false);
  });

  it('PARENT — faqat sessiyadagi farzandlar', async () => {
    const { resolver } = setup();
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

  it.each([true, false])('MENTOR — guruh scope natijasi (%s)', async (inScope) => {
    const { resolver, mentorScope } = setup(inScope);

    await expect(resolver.canAccess(account(Role.MENTOR, 'm1'), 's1')).resolves.toBe(inScope);
    expect(mentorScope.isMentorOf).toHaveBeenCalledWith('m1', 's1');
  });
});
