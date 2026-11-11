import { AuditAction, ErrorCode, GroupStatus, Role } from '@lms/shared';

import { actorOf } from '../../admin-users/testing/admin-users.fixtures.js';
import {
  fakeAuditor,
  fakeDetails,
  fakeReferences,
  fakeTransaction,
  groupRecord,
} from '../testing/groups.fixtures.js';

import { GroupMembersService } from './group-members.service.js';

import type { GroupRecord } from '../groups.types.js';
import type { GroupMembersRepository } from '../repositories/group-members.repository.js';

interface SetupOptions {
  record?: GroupRecord;
  active?: { studentId: string; groupId: string }[];
  conflicts?: string[];
  closed?: boolean;
}

function setup({
  record = groupRecord(),
  active = [],
  conflicts = [],
  closed = true,
}: SetupOptions = {}) {
  const members = {
    findActiveMemberships: jest.fn().mockResolvedValue(active),
    addActiveManyReportingConflicts: jest.fn().mockResolvedValue(conflicts),
    closeActive: jest.fn().mockResolvedValue(closed),
  };
  const { details, asDetails } = fakeDetails(record);
  const { references, asReferences } = fakeReferences();
  const { auditor, asAuditor } = fakeAuditor();
  const { transaction, asTransaction } = fakeTransaction();
  const service = new GroupMembersService(
    members as unknown as GroupMembersRepository,
    asDetails,
    asReferences,
    asAuditor,
    asTransaction,
  );
  return { service, members, details, references, auditor, transaction };
}

const actor = actorOf(Role.ADMIN);

describe('GroupMembersService.add', () => {
  it("studentlarni qo'shadi, audit va mentor keshi invalidatsiyasi; tafsilot qaytadi", async () => {
    const { service, members, references, auditor, transaction, details } = setup();

    await service.add('g1', ['s1', 's2'], actor);

    expect(references.requireStudents).toHaveBeenCalledWith(['s1', 's2']);
    expect(members.addActiveManyReportingConflicts).toHaveBeenCalledWith([
      { groupId: 'g1', studentId: 's1' },
      { groupId: 'g1', studentId: 's2' },
    ]);
    expect(auditor.record).toHaveBeenCalledWith(AuditAction.GROUP_MEMBERS_ADDED, 'g1', actor, {
      after: { studentIds: ['s1', 's2'] },
    });
    expect(transaction.affected).toHaveBeenCalledWith(['m1']);
    expect(details.detail).toHaveBeenCalledWith('g1');
  });

  it('arxivlangan guruh — 409 GROUP_ARCHIVED, hech narsa yozilmaydi', async () => {
    const { service, members } = setup({ record: groupRecord({ status: GroupStatus.ARCHIVED }) });

    await expect(service.add('g1', ['s1'], actor)).rejects.toMatchObject({
      code: ErrorCode.GROUP_ARCHIVED,
      status: 409,
    });
    expect(members.addActiveManyReportingConflicts).not.toHaveBeenCalled();
  });

  it('boshqa faol guruhdagi studentlar — 409, details da qaysilari', async () => {
    const { service, members, auditor } = setup({
      active: [{ studentId: 's2', groupId: 'g9' }],
    });

    await expect(service.add('g1', ['s1', 's2'], actor)).rejects.toMatchObject({
      code: ErrorCode.STUDENT_ALREADY_IN_GROUP,
      status: 409,
      details: { studentIds: ['s2'] },
    });
    expect(members.addActiveManyReportingConflicts).not.toHaveBeenCalled();
    expect(auditor.record).not.toHaveBeenCalled();
  });

  it("poyga (parallel so'rov qo'shib ulgurgan) — 409 faqat to'qnashgan studentlar bilan", async () => {
    const { service, auditor } = setup({ conflicts: ['s2'] });

    await expect(service.add('g1', ['s1', 's2', 's3'], actor)).rejects.toMatchObject({
      code: ErrorCode.STUDENT_ALREADY_IN_GROUP,
      details: { studentIds: ['s2'] },
    });
    expect(auditor.record).not.toHaveBeenCalled();
  });

  it('guruh qatori qulflanadi; status va mentor qulflangan yozuvdan olinadi', async () => {
    const { service, details } = setup();

    await service.add('g1', ['s1'], actor);
    await service.remove('g1', 's1', actor);

    expect(details.requireLockedGroup).toHaveBeenCalledTimes(2);
    expect(details.requireGroup).not.toHaveBeenCalled();
  });

  it("mentorsiz guruh — invalidatsiya ro'yxatida null", async () => {
    const { service, transaction } = setup({ record: groupRecord({ mentor: null }) });

    await service.add('g1', ['s1'], actor);

    expect(transaction.affected).toHaveBeenCalledWith([null]);
  });
});

describe('GroupMembersService.remove', () => {
  it("faol a'zolik yopiladi, audit va mentor keshi invalidatsiyasi", async () => {
    const { service, members, auditor, transaction } = setup();

    await service.remove('g1', 's1', actor);

    expect(members.closeActive).toHaveBeenCalledWith(
      { groupId: 'g1', studentId: 's1' },
      expect.any(Date),
    );
    expect(auditor.record).toHaveBeenCalledWith(AuditAction.GROUP_MEMBER_REMOVED, 'g1', actor, {
      before: { studentId: 's1' },
    });
    expect(transaction.affected).toHaveBeenCalledWith(['m1']);
  });

  it("faol a'zo emas — 404, audit yo'q", async () => {
    const { service, auditor } = setup({ closed: false });

    await expect(service.remove('g1', 's1', actor)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    expect(auditor.record).not.toHaveBeenCalled();
  });
});
