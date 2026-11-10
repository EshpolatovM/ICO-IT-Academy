import { Injectable } from '@nestjs/common';

import { AuditEntityType } from '@lms/shared';
import type { AuditAction } from '@lms/shared';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { AuditSnapshot } from '../../audit/audit.types.js';
import type { ParentTokenRecord } from '../parent-access.types.js';

/** Audit uchun token holati: xom token va hash YO'Q, faqat prefix. */
export function parentTokenAuditView(record: ParentTokenRecord): AuditSnapshot {
  return { studentId: record.studentId, prefix: record.tokenPrefix, label: record.label };
}

interface TokenAuditStates {
  before?: AuditSnapshot;
  after?: AuditSnapshot;
}

/** Bajarilgan amalning audit yozuvi. */
export interface TokenAuditEntry extends TokenAuditStates {
  action: AuditAction;
  tokenId: string;
}

/**
 * Ota-ona tokeni amallarini audit qilish (docs/01 §4: token yaratish/bekor qilish). Amal va uning
 * auditi bitta tranzaksiyada (`UnitOfWork`): audit yozilmasa, amal ham bekor bo'ladi.
 */
@Injectable()
export class ParentTokenAuditor {
  constructor(
    private readonly audit: AuditService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  /**
   * `work` ni tranzaksiyada bajaradi; natija bo'lsa (`null` emas) — `describe(natija)` auditi ham
   * shu tranzaksiyada yoziladi. Natija qaytadi.
   */
  runAudited<T>(
    actor: ActorContext,
    work: () => Promise<T | null>,
    describe: (result: T) => TokenAuditEntry,
  ): Promise<T | null> {
    return this.unitOfWork.run(async () => {
      const result = await work();
      if (result !== null) {
        const { action, tokenId, ...states } = describe(result);
        await this.record(actor, action, tokenId, states);
      }
      return result;
    });
  }

  record(
    actor: ActorContext,
    action: AuditAction,
    tokenId: string,
    states: TokenAuditStates,
  ): Promise<void> {
    return this.audit.record({
      actor: auditActor(actor.user),
      action,
      entityType: AuditEntityType.PARENT_ACCESS_TOKEN,
      entityId: tokenId,
      before: states.before,
      after: states.after,
      ip: actor.meta.ip,
    });
  }
}
