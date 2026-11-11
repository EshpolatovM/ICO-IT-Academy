import { AuditAction, ErrorCode, Role } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { actorOf } from '../../admin-users/testing/admin-users.fixtures.js';
import {
  fakeAuditor,
  fakeDetails,
  fakeReferences,
  fakeTransaction,
  groupRecord,
} from '../testing/groups.fixtures.js';

import { GroupMentorService } from './group-mentor.service.js';

import type { GroupsRepository } from '../repositories/groups.repository.js';

function setup(record = groupRecord()) {
  const groups = { setMentor: jest.fn().mockResolvedValue(undefined) };
  const { asDetails } = fakeDetails(record);
  const { references, asReferences } = fakeReferences();
  const { auditor, asAuditor } = fakeAuditor();
  const { transaction, asTransaction } = fakeTransaction();
  const service = new GroupMentorService(
    groups as unknown as GroupsRepository,
    asDetails,
    asReferences,
    asAuditor,
    asTransaction,
  );
  return { service, groups, references, auditor, transaction };
}

const actor = actorOf(Role.ADMIN);

describe('GroupMentorService', () => {
  it('yangi mentor: tekshiruv, yozuv, audit; eski va yangi mentor keshi invalidatsiya', async () => {
    const { service, groups, references, auditor, transaction } = setup();

    await service.assign('g1', 'm2', actor);

    expect(references.requireActiveMentor).toHaveBeenCalledWith('m2');
    expect(groups.setMentor).toHaveBeenCalledWith('g1', 'm2');
    expect(auditor.record).toHaveBeenCalledWith(AuditAction.GROUP_MENTOR_ASSIGNED, 'g1', actor, {
      before: { mentorId: 'm1' },
      after: { mentorId: 'm2' },
    });
    expect(transaction.affected).toHaveBeenCalledWith(['m1', 'm2']);
  });

  it('mentorni olib tashlash (null) — mentor tekshirilmaydi', async () => {
    const { service, groups, references } = setup();

    await service.assign('g1', null, actor);

    expect(references.requireActiveMentor).not.toHaveBeenCalled();
    expect(groups.setMentor).toHaveBeenCalledWith('g1', null);
  });

  it("o'sha mentor — no-op (yozuv va audit yo'q)", async () => {
    const { service, groups, auditor, transaction } = setup();

    await service.assign('g1', 'm1', actor);

    expect(groups.setMentor).not.toHaveBeenCalled();
    expect(auditor.record).not.toHaveBeenCalled();
    expect(transaction.affected).toHaveBeenCalledWith([]);
  });

  it('faol mentor emas — 400, yozilmaydi', async () => {
    const { service, groups, references } = setup(groupRecord({ mentor: null }));
    references.requireActiveMentor.mockRejectedValue(
      new AppException({ code: ErrorCode.VALIDATION_ERROR }),
    );

    await expect(service.assign('g1', 'x', actor)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
    expect(groups.setMentor).not.toHaveBeenCalled();
  });
});
