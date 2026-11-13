import { Injectable } from '@nestjs/common';

import { AuditAction } from '@lms/shared';
import type { AuditEntityType, ContentStatus } from '@lms/shared';

import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';
import { AUDIT_VALUE_OMITTED_FIELDS } from '../content.constants.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { AuditSnapshot } from '../../audit/audit.types.js';

/** Audit qilinadigan kontent obyekti. */
export interface ContentEntity {
  type: AuditEntityType;
  id: string;
}

export interface ContentAuditSnapshots {
  before?: AuditSnapshot;
  after?: AuditSnapshot;
}

/** `status` dan boshqa o'zgargan maydonlar; qiymati yozilmaydigan maydonlar (`contentMd`) tashlanadi. */
function valuesOf(source: object, fields: readonly string[]): AuditSnapshot {
  const record = source as Record<string, unknown>;
  return Object.fromEntries(
    fields
      .filter((field) => !AUDIT_VALUE_OMITTED_FIELDS.includes(field))
      .map((field) => [field, record[field]]),
  );
}

/**
 * Kontent auditi (3.2 §7; `GroupAuditor` naqshi): chaqiruvchining `UnitOfWork` i ichida.
 * Snapshot'lar kichik: `contentMd` qiymati hech qachon yozilmaydi (faqat `changedFields` da nomi).
 */
@Injectable()
export class ContentAuditor {
  constructor(private readonly audit: AuditService) {}

  record(
    action: AuditAction,
    entity: ContentEntity,
    actor: ActorContext,
    { before, after }: ContentAuditSnapshots,
  ): Promise<void> {
    return this.audit.record({
      actor: auditActor(actor.user),
      action,
      entityType: entity.type,
      entityId: entity.id,
      before: before ? valuesOf(before, Object.keys(before)) : null,
      after: after ? valuesOf(after, Object.keys(after)) : null,
      ip: actor.meta.ip,
    });
  }

  /**
   * PATCH auditi (diff bo'sh emas): `status` dan boshqa maydonlar — `CONTENT_UPDATED`
   * (`after.changedFields` bilan), `status` — alohida `CONTENT_STATUS_CHANGED`.
   */
  async recordPatch(
    entity: ContentEntity,
    actor: ActorContext,
    current: object,
    diff: object,
  ): Promise<void> {
    const { status, ...fields } = diff as { status?: ContentStatus };
    const changedFields = Object.keys(fields);
    if (changedFields.length > 0) {
      await this.record(AuditAction.CONTENT_UPDATED, entity, actor, {
        before: valuesOf(current, changedFields),
        after: { ...valuesOf(fields, changedFields), changedFields },
      });
    }
    const previous = (current as { status?: ContentStatus }).status;
    if (status !== undefined && previous !== undefined) {
      await this.recordStatus(entity, actor, previous, { status });
    }
  }

  recordStatus(
    entity: ContentEntity,
    actor: ActorContext,
    before: ContentStatus,
    after: AuditSnapshot & { status: ContentStatus },
  ): Promise<void> {
    return this.record(AuditAction.CONTENT_STATUS_CHANGED, entity, actor, {
      before: { status: before },
      after,
    });
  }
}
