import { AuditAction, AuditEntityType, Role } from '@lms/shared';

import { actorOf } from '../../admin-users/testing/admin-users.fixtures.js';

import { GroupAuditor } from './group-auditor.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { AuditService } from '../../audit/services/audit.service.js';

function setup() {
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  const auditor = new GroupAuditor(audit as unknown as AuditService);
  return { auditor, audit };
}

const GROUP_ACTIONS = [
  AuditAction.GROUP_CREATED,
  AuditAction.GROUP_UPDATED,
  AuditAction.GROUP_MENTOR_ASSIGNED,
  AuditAction.GROUP_MEMBERS_ADDED,
  AuditAction.GROUP_MEMBER_REMOVED,
] as const;

describe('GroupAuditor', () => {
  it.each(GROUP_ACTIONS)('%s — entityType GROUP, aktyor, ip va holatlar', async (action) => {
    const { auditor, audit } = setup();
    const actor = actorOf(Role.ADMIN, 'a1');

    await auditor.record(action, 'g1', actor, { before: { name: 'A' }, after: { name: 'B' } });

    expect(audit.record).toHaveBeenCalledWith({
      actor: { id: 'a1', role: Role.ADMIN },
      action,
      entityType: AuditEntityType.GROUP,
      entityId: 'g1',
      before: { name: 'A' },
      after: { name: 'B' },
      ip: '10.0.0.1',
    });
  });

  it('berilmagan `before`/`after` — `null` (undefined emas)', async () => {
    const { auditor, audit } = setup();

    await auditor.record(AuditAction.GROUP_CREATED, 'g1', actorOf(Role.SUPER_ADMIN), {
      after: { name: 'FE-12' },
    });
    await auditor.record(AuditAction.GROUP_MEMBER_REMOVED, 'g1', actorOf(Role.ADMIN), {
      before: { studentId: 's1' },
    });
    await auditor.record(AuditAction.GROUP_UPDATED, 'g1', actorOf(Role.ADMIN), {});

    const snapshotsOf = (before: unknown, after: unknown) =>
      expect.objectContaining({ before, after }) as unknown;
    expect(audit.record).toHaveBeenNthCalledWith(1, snapshotsOf(null, { name: 'FE-12' }));
    expect(audit.record).toHaveBeenNthCalledWith(2, snapshotsOf({ studentId: 's1' }, null));
    expect(audit.record).toHaveBeenNthCalledWith(3, snapshotsOf(null, null));
  });

  it("ip yo'q — `null` o'tadi; super admin aktyori roli bilan", async () => {
    const { auditor, audit } = setup();
    const actor: ActorContext = {
      ...actorOf(Role.SUPER_ADMIN, 'sa1'),
      meta: { ip: null, userAgent: null },
    };

    await auditor.record(AuditAction.GROUP_MENTOR_ASSIGNED, 'g2', actor, {});

    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: { id: 'sa1', role: Role.SUPER_ADMIN },
        entityId: 'g2',
        ip: null,
      }),
    );
  });

  it("AuditService xatosi chaqiruvchiga qaytariladi (tranzaksiya bekor bo'lsin)", async () => {
    const { auditor, audit } = setup();
    audit.record.mockRejectedValueOnce(new Error('db'));

    await expect(
      auditor.record(AuditAction.GROUP_CREATED, 'g1', actorOf(Role.ADMIN), {}),
    ).rejects.toThrow('db');
  });
});
