import { Role, UserStatus } from '@lms/shared';

import { AccountStatusService } from './account-status.service.js';

import type { TokenVersionService } from '../../auth/services/token-version.service.js';
import type { ParentAccessSuspensionService } from '../../parent-access/services/parent-access-suspension.service.js';

function setup() {
  const tokenVersions = { onVersionChanged: jest.fn().mockResolvedValue(undefined) };
  const parentAccess = {
    suspendStudent: jest.fn().mockResolvedValue(undefined),
    resumeStudent: jest.fn().mockResolvedValue(undefined),
  };
  const service = new AccountStatusService(
    tokenVersions as unknown as TokenVersionService,
    parentAccess as unknown as ParentAccessSuspensionService,
  );
  return { service, tokenVersions, parentAccess };
}

describe('AccountStatusService', () => {
  it("student deaktivatsiyasi: ver keshi va ota-ona sessiyalari to'xtatiladi", async () => {
    const { service, tokenVersions, parentAccess } = setup();

    await service.onStatusChanged({ id: 's1', role: Role.STUDENT }, UserStatus.INACTIVE, 7);

    expect(tokenVersions.onVersionChanged).toHaveBeenCalledWith('s1', 7);
    expect(parentAccess.suspendStudent).toHaveBeenCalledWith('s1');
    expect(parentAccess.resumeStudent).not.toHaveBeenCalled();
  });

  it("xodim deaktivatsiyasi: faqat ver keshi (ota-ona tokenlari yo'q)", async () => {
    const { service, tokenVersions, parentAccess } = setup();

    await service.onStatusChanged({ id: 'm1', role: Role.MENTOR }, UserStatus.INACTIVE, 2);

    expect(tokenVersions.onVersionChanged).toHaveBeenCalledWith('m1', 2);
    expect(parentAccess.suspendStudent).not.toHaveBeenCalled();
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
