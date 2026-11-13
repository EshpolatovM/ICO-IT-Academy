import { AuditAction, ContentStatus, Role } from '@lms/shared';

import { ACTOR } from '../testing/content.fixtures.js';

import { ContentAuditor } from './content-auditor.service.js';

import type { AuditService } from '../../audit/services/audit.service.js';

const ENTITY = { type: 'LESSON', id: 'l1' } as const;

function setup() {
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  return { audit, auditor: new ContentAuditor(audit as unknown as AuditService) };
}

describe('ContentAuditor', () => {
  it('yozuv: aktyor, obyekt, IP; snapshot berilmasa — null', async () => {
    const { audit, auditor } = setup();

    await auditor.record(AuditAction.CONTENT_DELETED, ENTITY, ACTOR, { before: { title: 'A' } });

    expect(audit.record).toHaveBeenCalledWith({
      actor: { id: 'a1', role: Role.ADMIN },
      action: AuditAction.CONTENT_DELETED,
      entityType: 'LESSON',
      entityId: 'l1',
      before: { title: 'A' },
      after: null,
      ip: '127.0.0.1',
    });
  });

  it("PATCH: contentMd qiymati snapshot'ga tushmaydi (faqat changedFields da), holat — alohida yozuv", async () => {
    const { audit, auditor } = setup();
    const current = { title: 'Eski', contentMd: 'katta matn', status: ContentStatus.DRAFT };

    await auditor.recordPatch(ENTITY, ACTOR, current, {
      title: 'Yangi',
      contentMd: 'yangi katta matn',
      status: ContentStatus.PUBLISHED,
    });

    expect(audit.record).toHaveBeenCalledTimes(2);
    expect(audit.record).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        action: AuditAction.CONTENT_UPDATED,
        before: { title: 'Eski' },
        after: { title: 'Yangi', changedFields: ['title', 'contentMd'] },
      }),
    );
    expect(audit.record).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        action: AuditAction.CONTENT_STATUS_CHANGED,
        before: { status: ContentStatus.DRAFT },
        after: { status: ContentStatus.PUBLISHED },
      }),
    );
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain('katta matn');
  });

  it("faqat holat o'zgarsa — bitta CONTENT_STATUS_CHANGED", async () => {
    const { audit, auditor } = setup();

    await auditor.recordPatch(
      ENTITY,
      ACTOR,
      { status: ContentStatus.DRAFT },
      {
        status: ContentStatus.ARCHIVED,
      },
    );

    expect(audit.record).toHaveBeenCalledTimes(1);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.CONTENT_STATUS_CHANGED }),
    );
  });
});
