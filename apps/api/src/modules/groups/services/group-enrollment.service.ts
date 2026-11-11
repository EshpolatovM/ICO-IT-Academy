import { Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';
import type { GroupRef } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { groupArchivedException, invalidReferenceException } from '../groups.errors.js';
import { GroupMembersRepository } from '../repositories/group-members.repository.js';
import { GroupsRepository } from '../repositories/groups.repository.js';

import { MentorScopeCache } from './mentor-scope-cache.service.js';

import type { NewMembership } from '../repositories/group-members.repository.js';

/**
 * Yangi studentni guruhga a'zo qilish (2.2: yaratish va CSV import; S-02: bitta faol guruh).
 * `requireActiveGroup`/`enroll*` — chaqiruvchining `UnitOfWork` i ichida; `refreshMentorScopes` —
 * tranzaksiya yakunlangandan keyin (guruh mentorlarining scope keshi yangilanadi, xato tashlamaydi).
 */
@Injectable()
export class GroupEnrollmentService {
  private readonly logger = new Logger(GroupEnrollmentService.name);

  constructor(
    private readonly groups: GroupsRepository,
    private readonly members: GroupMembersRepository,
    private readonly scopeCache: MentorScopeCache,
  ) {}

  /**
   * Faol (ACTIVE, o'chirilmagan) guruh; bo'lmasa — 400 `VALIDATION_ERROR` (`field` — so'rov maydoni).
   * Guruh qatori qulflanadi — parallel arxivlash bilan poyga yo'q.
   */
  async requireActiveGroup(groupId: string, field: string): Promise<GroupRef> {
    await this.groups.lockForUpdate(groupId);
    const group = await this.groups.findActiveRef(groupId);
    if (!group) {
      throw invalidReferenceException(field, 'Guruh topilmadi yoki faol emas');
    }
    return group;
  }

  /** Nomlari bo'yicha faol guruhlar (katta-kichik harf farqisiz; bir nomda bir nechta bo'lishi mumkin). */
  findActiveGroupsByNames(names: readonly string[]): Promise<GroupRef[]> {
    return this.groups.findActiveRefsByNames(names);
  }

  /**
   * Oldindan (tranzaksiyadan tashqarida) topilgan guruhlarni qulflaydi va hali ham faol ekanini
   * tekshiradi; birortasi arxivlangan/o'chirilgan bo'lsa — 409 `GROUP_ARCHIVED` (`details.groups`),
   * chaqiruvchining tranzaksiyasi bekor bo'ladi. Chaqiruvchining `UnitOfWork` i ichida.
   */
  async requireGroupsStillActive(groups: readonly GroupRef[]): Promise<void> {
    const byId = new Map(groups.map((group) => [group.id, group]));
    if (byId.size === 0) {
      return;
    }
    const ids = [...byId.keys()];
    await this.groups.lockManyForUpdate(ids);
    const active = new Set((await this.groups.findActiveRefs(ids)).map((group) => group.id));
    const inactive = [...byId.values()].filter((group) => !active.has(group.id));
    if (inactive.length > 0) {
      throw groupArchivedException(inactive);
    }
  }

  /** Faol a'zo qiladi; studentning boshqa faol guruhi bo'lsa — 409 `STUDENT_ALREADY_IN_GROUP`. */
  async enroll(membership: NewMembership): Promise<void> {
    const added = await this.members.addActive(membership);
    if (!added) {
      throw new AppException({ code: ErrorCode.STUDENT_ALREADY_IN_GROUP });
    }
  }

  /** Yangi yaratilgan studentlar (faol guruhi yo'q) uchun — bitta so'rovda. */
  enrollNewStudents(memberships: readonly NewMembership[]): Promise<void> {
    return this.members.addActiveMany(memberships);
  }

  /**
   * A'zo qo'shilgan guruhlar mentorlarining scope keshi invalidatsiyasi (commit'dan keyin). Xato
   * tashlamaydi (B1): baza yozilgan — javob muvaffaqiyatli; eng yomon holat — kesh TTL'i.
   */
  async refreshMentorScopes(groupIds: readonly string[]): Promise<void> {
    if (groupIds.length === 0) {
      return;
    }
    let mentorIds: string[];
    try {
      mentorIds = await this.groups.findMentorIds(groupIds);
    } catch (error) {
      this.logger.error(
        `Guruh mentorlarini o'qib bo'lmadi, scope keshi invalidatsiya qilinmadi ` +
          `(groupIds: ${groupIds.join(', ')}): ${String(error)}`,
      );
      return;
    }
    await this.scopeCache.invalidate(...mentorIds);
  }
}
