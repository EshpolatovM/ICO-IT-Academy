import { AuditAction, ErrorCode, Role } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import {
  actorOf,
  fakeAudit,
  fakePasswords,
  fakeUnitOfWork,
} from '../testing/admin-users.fixtures.js';

import { StudentAccountCreator } from './student-account-creator.service.js';

import type { InitialPasswordService } from './initial-password.service.js';
import type { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';
import type { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

const GROUP = { id: 'g1', name: 'FE-12' };

function setup() {
  const accounts = {
    createStudent: jest.fn().mockResolvedValue({ id: 's1', studentCode: 'ST-10245' }),
  };
  const enrollment = {
    requireActiveGroup: jest.fn().mockResolvedValue(GROUP),
    enroll: jest.fn().mockResolvedValue(undefined),
  };
  const { audit, asAudit } = fakeAudit();
  const { unitOfWork, asUnitOfWork } = fakeUnitOfWork();
  const creator = new StudentAccountCreator(
    accounts as unknown as UserAccountsRepository,
    enrollment as unknown as GroupEnrollmentService,
    fakePasswords() as unknown as InitialPasswordService,
    asAudit,
    asUnitOfWork,
  );
  return { creator, accounts, enrollment, audit, unitOfWork };
}

const actor = actorOf(Role.ADMIN);

describe('StudentAccountCreator', () => {
  it("guruhsiz: docs/12 §2 javobi, a'zolik yo'q", async () => {
    const { creator, enrollment } = setup();

    const response = await creator.create({ firstName: 'Ali', lastName: 'V' }, actor);

    expect(response).toEqual({
      id: 's1',
      studentCode: 'ST-10245',
      temporaryPassword: 'Temp1abc',
      mustChangePassword: true,
    });
    expect(enrollment.requireActiveGroup).not.toHaveBeenCalled();
    expect(enrollment.enroll).not.toHaveBeenCalled();
  });

  it("groupId bilan: guruh tekshiriladi, faol a'zo, audit groupId bilan — bitta tranzaksiyada", async () => {
    const { creator, enrollment, audit, unitOfWork } = setup();

    await creator.create({ firstName: 'Ali', lastName: 'V', groupId: 'g1' }, actor);

    expect(unitOfWork.run).toHaveBeenCalledTimes(1);
    expect(enrollment.requireActiveGroup).toHaveBeenCalledWith('g1', 'groupId');
    expect(enrollment.enroll).toHaveBeenCalledWith({ groupId: 'g1', studentId: 's1' });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.USER_CREATED,
        after: expect.objectContaining({ groupId: 'g1', studentCode: 'ST-10245' }) as object,
      }),
    );
  });

  it("guruh topilmasa/faol bo'lmasa — 400, student yaratilmaydi", async () => {
    const { creator, accounts, enrollment } = setup();
    enrollment.requireActiveGroup.mockRejectedValue(
      new AppException({ code: ErrorCode.VALIDATION_ERROR }),
    );

    await expect(
      creator.create({ firstName: 'Ali', lastName: 'V', groupId: 'g1' }, actor),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });
    expect(accounts.createStudent).not.toHaveBeenCalled();
  });

  it('ikkinchi faol guruh — 409 STUDENT_ALREADY_IN_GROUP, audit yozilmaydi (tranzaksiya bekor)', async () => {
    const { creator, enrollment, audit } = setup();
    enrollment.enroll.mockRejectedValue(
      new AppException({ code: ErrorCode.STUDENT_ALREADY_IN_GROUP }),
    );

    await expect(
      creator.create({ firstName: 'Ali', lastName: 'V', groupId: 'g1' }, actor),
    ).rejects.toMatchObject({ code: ErrorCode.STUDENT_ALREADY_IN_GROUP, status: 409 });
    expect(audit.record).not.toHaveBeenCalled();
  });
});
