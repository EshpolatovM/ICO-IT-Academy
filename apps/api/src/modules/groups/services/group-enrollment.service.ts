import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';
import type { GroupRef } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { GroupMembersRepository } from '../repositories/group-members.repository.js';
import { GroupsRepository } from '../repositories/groups.repository.js';

import type { NewMembership } from '../repositories/group-members.repository.js';

/**
 * Studentni guruhga a'zo qilish (S-02: bitta faol guruh). Chaqiruvchining `UnitOfWork` i ichida
 * ishlatiladi — guruh tekshiruvi, a'zolik va asosiy amal bitta tranzaksiyada.
 */
@Injectable()
export class GroupEnrollmentService {
  constructor(
    private readonly groups: GroupsRepository,
    private readonly members: GroupMembersRepository,
  ) {}

  /** Faol (ACTIVE, o'chirilmagan) guruh; bo'lmasa — 400 `VALIDATION_ERROR` (`field` — so'rov maydoni). */
  async requireActiveGroup(groupId: string, field: string): Promise<GroupRef> {
    const group = await this.groups.findActiveRef(groupId);
    if (!group) {
      throw new AppException({
        code: ErrorCode.VALIDATION_ERROR,
        details: [{ field, message: 'Guruh topilmadi yoki faol emas' }],
      });
    }
    return group;
  }

  /** Nomlari bo'yicha faol guruhlar (katta-kichik harf farqisiz; bir nomda bir nechta bo'lishi mumkin). */
  findActiveGroupsByNames(names: readonly string[]): Promise<GroupRef[]> {
    return this.groups.findActiveRefsByNames(names);
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
}
