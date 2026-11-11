import { AuditAction, ErrorCode, GroupStatus, Role } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { actorOf } from '../../admin-users/testing/admin-users.fixtures.js';
import {
  fakeAuditor,
  fakeDetails,
  fakeReferences,
  fakeTransaction,
  groupRecord,
} from '../testing/groups.fixtures.js';

import { AdminGroupsService } from './admin-groups.service.js';

import type { GroupsRepository } from '../repositories/groups.repository.js';

function setup(record = groupRecord()) {
  const groups = {
    search: jest.fn().mockResolvedValue({ items: [record], total: 1 }),
    createGroup: jest.fn().mockResolvedValue({ id: 'g2' }),
    applyChanges: jest.fn().mockResolvedValue(undefined),
  };
  const { details, asDetails } = fakeDetails(record);
  const { references, asReferences } = fakeReferences();
  const { auditor, asAuditor } = fakeAuditor();
  const { transaction, asTransaction } = fakeTransaction();
  const service = new AdminGroupsService(
    groups as unknown as GroupsRepository,
    asDetails,
    asReferences,
    asAuditor,
    asTransaction,
  );
  return { service, groups, details, references, auditor, transaction };
}

const actor = actorOf(Role.ADMIN);
const PAGE = { page: 1, pageSize: 20, q: undefined, mentorId: undefined, pathId: undefined };

describe('AdminGroupsService', () => {
  it("ro'yxat: pagination, mentor ismi, a'zolar soni, sana YYYY-MM-DD", async () => {
    const { service, groups } = setup(groupRecord({ membersCount: 3 }));

    const result = await service.list({ ...PAGE, status: GroupStatus.ACTIVE });

    expect(groups.search).toHaveBeenCalledWith({ ...PAGE, status: GroupStatus.ACTIVE });
    expect(result).toMatchObject({
      total: 1,
      page: 1,
      pageSize: 20,
      items: [
        { id: 'g1', startsAt: '2026-11-15', membersCount: 3, mentor: { firstName: 'Bobur' } },
      ],
    });
  });

  it("yaratish: yo'l va mentor tekshiriladi, ACTIVE, audit; scope o'zgarmaydi", async () => {
    const { service, groups, references, auditor, transaction, details } = setup();

    await service.create(
      { name: 'FE-13', pathId: 'p1', mentorId: 'm1', startsAt: '2026-12-01' },
      actor,
    );

    expect(references.requirePath).toHaveBeenCalledWith('p1');
    expect(references.requireActiveMentor).toHaveBeenCalledWith('m1');
    expect(groups.createGroup).toHaveBeenCalledWith({
      name: 'FE-13',
      pathId: 'p1',
      mentorId: 'm1',
      startsAt: new Date('2026-12-01T00:00:00.000Z'),
    });
    expect(auditor.record).toHaveBeenCalledWith(AuditAction.GROUP_CREATED, 'g2', actor, {
      after: {
        name: 'FE-13',
        status: GroupStatus.ACTIVE,
        startsAt: '2026-12-01',
        pathId: 'p1',
        mentorId: 'm1',
      },
    });
    expect(transaction.affected).toHaveBeenCalledWith([]);
    expect(details.detail).toHaveBeenCalledWith('g2');
  });

  it("yaratish mentorsiz — mentor tekshirilmaydi; yo'l topilmasa 400", async () => {
    const { service, references, groups } = setup();

    await service.create({ name: 'FE-13', pathId: 'p1' }, actor);
    expect(references.requireActiveMentor).not.toHaveBeenCalled();
    expect(groups.createGroup).toHaveBeenCalledWith(
      expect.objectContaining({ mentorId: null, startsAt: null }),
    );

    references.requirePath.mockRejectedValue(
      new AppException({ code: ErrorCode.VALIDATION_ERROR }),
    );
    await expect(service.create({ name: 'X', pathId: 'p9' }, actor)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });

  it("o'zgarmagan qiymatlar — no-op (yozuv va audit yo'q)", async () => {
    const { service, groups, transaction } = setup();

    await service.update('g1', { name: 'FE-12', startsAt: '2026-11-15' }, actor);

    expect(groups.applyChanges).not.toHaveBeenCalled();
    expect(transaction.affected).toHaveBeenCalledWith([]);
  });

  it("nom va sana: faqat o'zgarganlar, audit oldin/keyin; scope invalidatsiyasi yo'q", async () => {
    const { service, groups, auditor, transaction } = setup();

    await service.update('g1', { name: 'FE-12b', startsAt: null }, actor);

    expect(groups.applyChanges).toHaveBeenCalledWith('g1', { name: 'FE-12b', startsAt: null });
    expect(auditor.record).toHaveBeenCalledWith(AuditAction.GROUP_UPDATED, 'g1', actor, {
      before: { name: 'FE-12', startsAt: '2026-11-15' },
      after: { name: 'FE-12b', startsAt: null },
    });
    expect(transaction.affected).toHaveBeenCalledWith([]);
  });

  it('arxivlash — guruh mentorining scope keshi invalidatsiya qilinadi', async () => {
    const { service, groups, transaction } = setup();

    await service.update('g1', { status: GroupStatus.ARCHIVED }, actor);

    expect(groups.applyChanges).toHaveBeenCalledWith('g1', { status: GroupStatus.ARCHIVED });
    expect(transaction.affected).toHaveBeenCalledWith(['m1']);
  });
});
