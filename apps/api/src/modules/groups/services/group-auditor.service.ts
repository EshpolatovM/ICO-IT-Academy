import { Injectable } from '@nestjs/common';

import { AuditEntityType } from '@lms/shared';
import type { AuditAction } from '@lms/shared';

import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { AuditSnapshot } from '../../audit/audit.types.js';

export interface GroupAuditSnapshots {
  before?: AuditSnapshot;
  after?: AuditSnapshot;
}

/** Guruh amallari auditi (`entity_type = GROUP`, docs/01 §4). Chaqiruvchining `UnitOfWork` i ichida. */
@Injectable()
export class GroupAuditor {
  constructor(private readonly audit: AuditService) {}

  record(
    action: AuditAction,
    groupId: string,
    actor: ActorContext,
    snapshots: GroupAuditSnapshots,
  ): Promise<void> {
    return this.audit.record({
      actor: auditActor(actor.user),
      action,
      entityType: AuditEntityType.GROUP,
      entityId: groupId,
      before: snapshots.before ?? null,
      after: snapshots.after ?? null,
      ip: actor.meta.ip,
    });
  }
}
