import { AuditAction, AuditEntityType, ErrorCode, Role, UserStatus } from '@lms/shared';

import {
  accountRecord,
  actorOf,
  fakeAudit,
  fakeUnitOfWork,
} from '../testing/admin-users.fixtures.js';

import { AccountUpdateService, diffChanges } from './account-update.service.js';

import type { AccountStatusService } from './account-status.service.js';
import type { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

function setup({ phoneTaken = false } = {}) {
  const accounts = {
    isPhoneTaken: jest.fn().mockResolvedValue(phoneTaken),
    applyChanges: jest.fn().mockResolvedValue({ tokenVersion: 3 }),
  };
  const { audit, asAudit } = fakeAudit();
  const { unitOfWork, asUnitOfWork } = fakeUnitOfWork();
  const status = { onStatusChanged: jest.fn().mockResolvedValue(undefined) };
  const service = new AccountUpdateService(
    accounts as unknown as UserAccountsRepository,
    asAudit,
    asUnitOfWork,
    status as unknown as AccountStatusService,
  );
  return { service, accounts, audit, unitOfWork, status };
}

const actor = actorOf(Role.ADMIN);

describe('diffChanges', () => {
  it("faqat o'zgargan maydonlar qoladi", () => {
    const target = accountRecord(Role.MENTOR);

    expect(
      diffChanges(target, { firstName: 'Ali', lastName: 'Yangi', status: UserStatus.ACTIVE }),
    ).toEqual({ lastName: 'Yangi' });
  });
});

describe('AccountUpdateService', () => {
  it("hech narsa o'zgarmasa — yozuv ham, audit ham yo'q", async () => {
    const { service, accounts, audit } = setup();

    await service.update(accountRecord(Role.MENTOR), { firstName: 'Ali' }, actor);

    expect(accounts.applyChanges).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('deaktivatsiya: tranzaksiyada yozuv + USER_DEACTIVATED, keyin holat effektlari', async () => {
    const { service, accounts, audit, unitOfWork, status } = setup();
    const target = accountRecord(Role.STUDENT, { id: 's1' });

    await service.update(target, { status: UserStatus.INACTIVE }, actor);

    expect(unitOfWork.run).toHaveBeenCalledTimes(1);
    expect(accounts.applyChanges).toHaveBeenCalledWith(
      's1',
      { status: UserStatus.INACTIVE },
      expect.any(Date),
    );
    expect(audit.record).toHaveBeenCalledWith({
      actor: { id: 'actor', role: Role.ADMIN },
      entityType: AuditEntityType.USER,
      entityId: 's1',
      ip: '10.0.0.1',
      action: AuditAction.USER_DEACTIVATED,
      before: { role: Role.STUDENT, status: UserStatus.ACTIVE },
      after: { role: Role.STUDENT, status: UserStatus.INACTIVE },
    });
    expect(status.onStatusChanged).toHaveBeenCalledWith(target, UserStatus.INACTIVE, 3);
  });

  it('aktivatsiya — USER_ACTIVATED', async () => {
    const { service, audit } = setup();
    const target = accountRecord(Role.MENTOR, { status: UserStatus.INACTIVE });

    await service.update(target, { status: UserStatus.ACTIVE }, actor);

    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.USER_ACTIVATED }),
    );
  });

  it('profil + holat: USER_UPDATED (oldin/keyin) va USER_DEACTIVATED', async () => {
    const { service, audit } = setup();
    const target = accountRecord(Role.MENTOR);

    await service.update(
      target,
      { lastName: 'Yangi', phone: '+998901112233', status: UserStatus.INACTIVE },
      actor,
    );

    expect(audit.record).toHaveBeenCalledTimes(2);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.USER_UPDATED,
        before: { role: Role.MENTOR, lastName: 'Valiyev', phone: '+998900000001' },
        after: { role: Role.MENTOR, lastName: 'Yangi', phone: '+998901112233' },
      }),
    );
  });

  it('telefon band — 409, hech narsa yozilmaydi', async () => {
    const { service, accounts } = setup({ phoneTaken: true });

    await expect(
      service.update(accountRecord(Role.ADMIN), { phone: '+998901112233' }, actor),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT, details: { field: 'phone' } });
    expect(accounts.isPhoneTaken).toHaveBeenCalledWith('+998901112233', 'u1');
    expect(accounts.applyChanges).not.toHaveBeenCalled();
  });
});
