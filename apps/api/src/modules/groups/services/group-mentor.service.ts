import { Injectable } from '@nestjs/common';

import { AuditAction } from '@lms/shared';
import type { AdminGroupDetail } from '@lms/shared';

import { GroupsRepository } from '../repositories/groups.repository.js';

import { GroupAuditor } from './group-auditor.service.js';
import { GroupDetailsService } from './group-details.service.js';
import { GroupReferences } from './group-references.service.js';
import { GroupTransaction } from './group-transaction.service.js';

import type { GroupChange } from './group-transaction.service.js';
import type { ActorContext } from '../../../common/auth/request-user.types.js';

/**
 * Mentorni guruhga biriktirish / olib tashlash (`PUT /admin/groups/:id/mentor`, SA A; S-03 A:
 * bitta mentor). Yangi mentor — faqat faol MENTOR (aks holda 400). Oldingi mentor tranzaksiya ichida
 * qulflangan qatordan olinadi; commit'dan keyin eski va yangi mentorning scope keshi invalidatsiya
 * qilinadi (eski mentor guruh studentlarini darhol ko'rmaydi). O'sha mentor — no-op (audit yo'q).
 */
@Injectable()
export class GroupMentorService {
  constructor(
    private readonly groups: GroupsRepository,
    private readonly details: GroupDetailsService,
    private readonly references: GroupReferences,
    private readonly auditor: GroupAuditor,
    private readonly transaction: GroupTransaction,
  ) {}

  async assign(
    id: string,
    mentorId: string | null,
    actor: ActorContext,
  ): Promise<AdminGroupDetail> {
    await this.transaction.commit(async (): Promise<GroupChange<void>> => {
      const target = await this.details.requireLockedGroup(id);
      const previousId = target.mentor?.id ?? null;
      if (previousId === mentorId) {
        return { result: undefined, affectedMentorIds: [] };
      }
      if (mentorId !== null) {
        await this.references.requireActiveMentor(mentorId);
      }
      await this.groups.setMentor(id, mentorId);
      await this.auditor.record(AuditAction.GROUP_MENTOR_ASSIGNED, id, actor, {
        before: { mentorId: previousId },
        after: { mentorId },
      });
      return { result: undefined, affectedMentorIds: [previousId, mentorId] };
    });
    return this.details.detail(id);
  }
}
