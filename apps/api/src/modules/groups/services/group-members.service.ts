import { Injectable } from '@nestjs/common';

import { AuditAction, ErrorCode, GroupStatus } from '@lms/shared';
import type { AdminGroupDetail } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { groupArchivedException, studentsAlreadyInGroupException } from '../groups.errors.js';
import { GroupMembersRepository } from '../repositories/group-members.repository.js';

import { GroupAuditor } from './group-auditor.service.js';
import { GroupDetailsService } from './group-details.service.js';
import { GroupReferences } from './group-references.service.js';
import { GroupTransaction } from './group-transaction.service.js';

import type { GroupChange } from './group-transaction.service.js';
import type { ActorContext } from '../../../common/auth/request-user.types.js';

/**
 * Guruh a'zolari (docs/12 §2: SA A): bir nechta studentni qo'shish va bittasini chiqarish
 * (`left_at = now()`, yozuv tarix sifatida qoladi). S-02 A: student boshqa faol guruhda bo'lsa —
 * 409 `STUDENT_ALREADY_IN_GROUP` (`details.studentIds` — faqat haqiqatan to'qnashganlar);
 * arxivlangan guruhga qo'shib bo'lmaydi — 409 `GROUP_ARCHIVED`. "Ko'chirish" yo'q.
 * Guruh qatori tranzaksiya ichida qulflanadi (parallel arxivlash/mentor almashtirish bilan poyga
 * yo'q); commit'dan keyin guruh mentorining scope keshi invalidatsiya qilinadi (S-10 A — darhol).
 */
@Injectable()
export class GroupMembersService {
  constructor(
    private readonly members: GroupMembersRepository,
    private readonly details: GroupDetailsService,
    private readonly references: GroupReferences,
    private readonly auditor: GroupAuditor,
    private readonly transaction: GroupTransaction,
  ) {}

  async add(
    groupId: string,
    studentIds: readonly string[],
    actor: ActorContext,
  ): Promise<AdminGroupDetail> {
    await this.transaction.commit(async (): Promise<GroupChange<void>> => {
      const target = await this.details.requireLockedGroup(groupId);
      if (target.status === GroupStatus.ARCHIVED) {
        throw groupArchivedException();
      }
      await this.references.requireStudents(studentIds);
      await this.requireNoActiveMemberships(studentIds);
      const conflicts = await this.members.addActiveManyReportingConflicts(
        studentIds.map((studentId) => ({ groupId, studentId })),
      );
      if (conflicts.length > 0) {
        throw studentsAlreadyInGroupException(conflicts);
      }
      await this.auditor.record(AuditAction.GROUP_MEMBERS_ADDED, groupId, actor, {
        after: { studentIds: [...studentIds] },
      });
      return { result: undefined, affectedMentorIds: [target.mentor?.id ?? null] };
    });
    return this.details.detail(groupId);
  }

  async remove(groupId: string, studentId: string, actor: ActorContext): Promise<void> {
    await this.transaction.commit(async (): Promise<GroupChange<void>> => {
      const target = await this.details.requireLockedGroup(groupId);
      const closed = await this.members.closeActive({ groupId, studentId }, new Date());
      if (!closed) {
        throw new AppException({ code: ErrorCode.NOT_FOUND });
      }
      await this.auditor.record(AuditAction.GROUP_MEMBER_REMOVED, groupId, actor, {
        before: { studentId },
      });
      return { result: undefined, affectedMentorIds: [target.mentor?.id ?? null] };
    });
  }

  /** Istalgan guruhda (shu guruh ham) faol a'zo bo'lganlar — 409, ro'yxati bilan. */
  private async requireNoActiveMemberships(studentIds: readonly string[]): Promise<void> {
    const active = await this.members.findActiveMemberships(studentIds);
    if (active.length > 0) {
      throw studentsAlreadyInGroupException(active.map((membership) => membership.studentId));
    }
  }
}
