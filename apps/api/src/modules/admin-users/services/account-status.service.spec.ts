import { Role, UserStatus } from '@lms/shared';

import { AccountStatusService } from './account-status.service.js';

import type { TokenVersionService } from '../../auth/services/token-version.service.js';
import type { MentorScopeCache } from '../../groups/services/mentor-scope-cache.service.js';
import type { ParentAccessSuspensionService } from '../../parent-access/services/parent-access-suspension.service.js';

function setup() {
  const tokenVersions = { onVersionChanged: jest.fn().mockResolvedValue(undefined) };
  const parentAccess = {
    suspendStudent: jest.fn().mockResolvedValue(undefined),
    resumeStudent: jest.fn().mockResolvedValue(undefined),
  };
  const mentorScopes = { invalidate: jest.fn().mockResolvedValue(undefined) };
  const service = new AccountStatusService(
    tokenVersions as unknown as TokenVersionService,
    parentAccess as unknown as ParentAccessSuspensionService,
    mentorScopes as unknown as MentorScopeCache,
  );
  return { service, tokenVersions, parentAccess, mentorScopes };
}

describe('AccountStatusService', () => {
  it("student deaktivatsiyasi: ver keshi va ota-ona sessiyalari to'xtatiladi", async () => {
    const { service, tokenVersions, parentAccess } = setup();

    await service.onStatusChanged({ id: 's1', role: Role.STUDENT }, UserStatus.INACTIVE, 7);

    expect(tokenVersions.onVersionChanged).toHaveBeenCalledWith('s1', 7);
    expect(parentAccess.suspendStudent).toHaveBeenCalledWith('s1');
    expect(parentAccess.resumeStudent).not.toHaveBeenCalled();
  });

  it("mentor deaktivatsiyasi: ver keshi va scope keshi (ota-ona tokenlari yo'q)", async () => {
    const { service, tokenVersions, parentAccess, mentorScopes } = setup();

    await service.onStatusChanged({ id: 'm1', role: Role.MENTOR }, UserStatus.INACTIVE, 2);

    expect(tokenVersions.onVersionChanged).toHaveBeenCalledWith('m1', 2);
    expect(parentAccess.suspendStudent).not.toHaveBeenCalled();
    expect(mentorScopes.invalidate).toHaveBeenCalledWith('m1');
  });

  it("student va admin deaktivatsiyasi scope keshiga tegmaydi (a'zolik o'zgarmaydi)", async () => {
    const { service, mentorScopes } = setup();

    await service.onStatusChanged({ id: 's1', role: Role.STUDENT }, UserStatus.INACTIVE, 3);
    await service.onStatusChanged({ id: 'a1', role: Role.ADMIN }, UserStatus.INACTIVE, 3);

    expect(mentorScopes.invalidate).not.toHaveBeenCalled();
  });

  it("aktivatsiya: ver o'zgarmaydi, student uchun ota-ona keshi tiklanadi", async () => {
    const { service, tokenVersions, parentAccess } = setup();

    await service.onStatusChanged({ id: 's1', role: Role.STUDENT }, UserStatus.ACTIVE, 7);
    await service.onStatusChanged({ id: 'a1', role: Role.ADMIN }, UserStatus.ACTIVE, 1);

    expect(tokenVersions.onVersionChanged).not.toHaveBeenCalled();
    expect(parentAccess.resumeStudent).toHaveBeenCalledTimes(1);
    expect(parentAccess.resumeStudent).toHaveBeenCalledWith('s1');
  });
});
