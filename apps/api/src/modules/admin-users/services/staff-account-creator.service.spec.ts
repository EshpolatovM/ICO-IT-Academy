import { AuditAction, AuditEntityType, ErrorCode, Role } from '@lms/shared';

import {
  actorOf,
  fakeAudit,
  fakePasswords,
  fakeUnitOfWork,
} from '../testing/admin-users.fixtures.js';

import { StaffAccountCreator } from './staff-account-creator.service.js';

import type { InitialPasswordService } from './initial-password.service.js';
import type { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

function setup({ phoneTaken = false } = {}) {
  const accounts = {
    isPhoneTaken: jest.fn().mockResolvedValue(phoneTaken),
    createStaff: jest.fn().mockResolvedValue({ id: 'new' }),
  };
  const passwords = fakePasswords();
  const { audit, asAudit } = fakeAudit();
  const { unitOfWork, asUnitOfWork } = fakeUnitOfWork();
  const creator = new StaffAccountCreator(
    accounts as unknown as UserAccountsRepository,
    passwords as unknown as InitialPasswordService,
    asAudit,
    asUnitOfWork,
  );
  return { creator, accounts, audit, unitOfWork };
}

const request = { phone: '+998901234567', firstName: 'Vali', lastName: 'Aliyev', password: null };

describe('StaffAccountCreator', () => {
  it('parolsiz: vaqtinchalik parol javobda, hash saqlanadi, audit (parolsiz) tranzaksiyada', async () => {
    const { creator, accounts, audit, unitOfWork } = setup();

    const response = await creator.create(Role.MENTOR, request, actorOf(Role.ADMIN));

    expect(response).toEqual({
      id: 'new',
      phone: '+998901234567',
      temporaryPassword: 'Temp1abc',
      mustChangePassword: true,
    });
    expect(accounts.createStaff).toHaveBeenCalledWith({
      role: Role.MENTOR,
      phone: '+998901234567',
      firstName: 'Vali',
      lastName: 'Aliyev',
      passwordHash: 'hash(Temp1abc)',
      createdById: 'actor',
    });
    expect(unitOfWork.run).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.USER_CREATED,
        entityType: AuditEntityType.USER,
        entityId: 'new',
        after: expect.objectContaining({ role: Role.MENTOR, passwordGenerated: true }) as object,
      }),
    );
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain('Temp1abc');
  });

  it('parol berilsa — temporaryPassword null, lekin birinchi kirishda almashtiriladi', async () => {
    const { creator } = setup();

    const response = await creator.create(
      Role.ADMIN,
      { ...request, password: 'Berilgan1x' },
      actorOf(Role.SUPER_ADMIN),
    );

    expect(response).toMatchObject({ temporaryPassword: null, mustChangePassword: true });
  });

  it('telefon band — 409, yaratilmaydi', async () => {
    const { creator, accounts } = setup({ phoneTaken: true });

    await expect(creator.create(Role.MENTOR, request, actorOf(Role.ADMIN))).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
    });
    expect(accounts.createStaff).not.toHaveBeenCalled();
  });
});
