import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../infra/prisma/generated/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/** Unique buzilishi. `group_members` dagi yagona unique — `uq_group_members_active_student` (S-02). */
const PRISMA_UNIQUE_VIOLATION = 'P2002';

export interface NewMembership {
  groupId: string;
  studentId: string;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === PRISMA_UNIQUE_VIOLATION
  );
}

/**
 * `group_members` jadvali (docs/11 §2). Yozuvlar joriy tranzaksiyaga qo'shiladi
 * (`PrismaService.client`) — student yaratish va audit bilan bitta `UnitOfWork` da.
 * `BaseRepository` dan meros olmaydi: a'zolik tarixiy yozuv (umumiy `update`/pagination emas,
 * chiqishda `left_at` yoziladi — 2.3).
 */
@Injectable()
export class GroupMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Faol a'zo qo'shadi. Studentning boshqa faol guruhi bo'lsa (partial unique
   * `uq_group_members_active_student`) — `false`; chaqiruvchi domen xatosini (409) beradi va
   * tranzaksiya bekor bo'ladi.
   */
  async addActive(membership: NewMembership): Promise<boolean> {
    try {
      await this.prisma.client.groupMember.create({ data: membership, select: { id: true } });
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return false;
      }
      throw error;
    }
  }

  /** Yangi yaratilgan studentlar uchun (CSV import) — bitta so'rovda. */
  async addActiveMany(memberships: readonly NewMembership[]): Promise<void> {
    if (memberships.length === 0) {
      return;
    }
    await this.prisma.client.groupMember.createMany({ data: [...memberships] });
  }
}
