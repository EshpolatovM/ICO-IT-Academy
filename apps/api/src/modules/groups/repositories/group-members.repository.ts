import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../infra/prisma/generated/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { ActiveMembershipRecord, GroupMemberRecord } from '../groups.types.js';

/** Unique buzilishi. `group_members` dagi yagona unique — `uq_group_members_active_student` (S-02). */
const PRISMA_UNIQUE_VIOLATION = 'P2002';

/**
 * Studentning faol guruhi (`users` select'ida nested): o'chirilmagan guruhdagi faol a'zolik
 * (S-02: bittadan ko'p emas). Nested yozuvlar soft delete extension bilan filtrlanmaydi —
 * `deletedAt: null` aniq yozilgan. Boshqa repository'lar ham shuni ishlatadi (admin, ota-ona).
 */
export const ACTIVE_GROUP_MEMBERSHIP_SELECT = {
  where: { leftAt: null, group: { deletedAt: null } },
  take: 1,
  select: { group: { select: { id: true, name: true } } },
} as const satisfies Prisma.User$groupMembershipsArgs;

/** Faol a'zolik (o'chirilmagan student) — `group_members` so'rovlari va `_count` uchun. */
export const ACTIVE_MEMBER_WHERE = {
  leftAt: null,
  student: { deletedAt: null },
} as const satisfies Prisma.GroupMemberWhereInput;

/** A'zolar ro'yxati tartibi: familiya, ism. */
export const MEMBER_ORDER_BY = [
  { student: { lastName: 'asc' } },
  { student: { firstName: 'asc' } },
] as const satisfies Prisma.GroupMemberOrderByWithRelationInput[];

export interface NewMembership {
  groupId: string;
  studentId: string;
}

const MEMBER_SELECT = {
  joinedAt: true,
  student: {
    select: { id: true, studentCode: true, firstName: true, lastName: true, status: true },
  },
} as const satisfies Prisma.GroupMemberSelect;

/** Lokalsiz (kod birliklari bo'yicha) taqqoslash — UUID matni uchun Postgres tartibi bilan bir xil. */
function compareCodeUnits(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

/**
 * Ko'p qatorli insert `studentId` tartibida: parallel so'rovlar unique indeks qulflarini bir xil
 * tartibda oladi — deadlock (`40P01` → 500) o'rniga biri kutadi va to'qnashuv (409) oladi.
 */
function sortedByStudentId(memberships: readonly NewMembership[]): NewMembership[] {
  return [...memberships].sort((a, b) => compareCodeUnits(a.studentId, b.studentId));
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === PRISMA_UNIQUE_VIOLATION
  );
}

/**
 * `group_members` jadvali (docs/11 §2). Yozuvlar joriy tranzaksiyaga qo'shiladi
 * (`PrismaService.client`) — asosiy amal va audit bilan bitta `UnitOfWork` da.
 * `BaseRepository` dan meros olmaydi: a'zolik tarixiy yozuv (umumiy `update`/pagination emas,
 * chiqishda `left_at` yoziladi, yozuv o'chirilmaydi).
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
    return this.tryCreate(() =>
      this.prisma.client.groupMember.create({ data: membership, select: { id: true } }),
    );
  }

  /**
   * Bir nechta faol a'zo (bitta so'rov, `ON CONFLICT DO NOTHING`). Qo'shilmay qolgan (parallel so'rov
   * allaqachon boshqa faol guruhga qo'shgan — `uq_group_members_active_student`) studentlar
   * qaytariladi (kirish tartibida); chaqiruvchi 409 beradi va tranzaksiya bekor bo'ladi.
   */
  async addActiveManyReportingConflicts(memberships: readonly NewMembership[]): Promise<string[]> {
    const inserted = await this.prisma.client.groupMember.createManyAndReturn({
      data: sortedByStudentId(memberships),
      skipDuplicates: true,
      select: { studentId: true },
    });
    const added = new Set(inserted.map((row) => row.studentId));
    return memberships.flatMap(({ studentId }) => (added.has(studentId) ? [] : [studentId]));
  }

  /** Yangi yaratilgan studentlar uchun (CSV import) — bitta so'rovda. */
  async addActiveMany(memberships: readonly NewMembership[]): Promise<void> {
    if (memberships.length === 0) {
      return;
    }
    await this.prisma.client.groupMember.createMany({ data: sortedByStudentId(memberships) });
  }

  /** Berilgan studentlarning faol a'zoliklari (istalgan guruhda). */
  findActiveMemberships(studentIds: readonly string[]): Promise<ActiveMembershipRecord[]> {
    return this.prisma.client.groupMember.findMany({
      where: { studentId: { in: [...studentIds] }, leftAt: null },
      select: { studentId: true, groupId: true },
    });
  }

  /** Guruhning faol a'zolari (o'chirilmagan studentlar), familiya bo'yicha. */
  async listActiveMembers(groupId: string): Promise<GroupMemberRecord[]> {
    const rows = await this.prisma.client.groupMember.findMany({
      where: { groupId, ...ACTIVE_MEMBER_WHERE },
      orderBy: [...MEMBER_ORDER_BY],
      select: MEMBER_SELECT,
    });
    return rows.map(({ joinedAt, student }) => ({ ...student, joinedAt }));
  }

  /** Faol a'zolikni yopadi (`left_at`). Faol a'zolik topilmasa — `false`. */
  async closeActive(membership: NewMembership, at: Date): Promise<boolean> {
    const { count } = await this.prisma.client.groupMember.updateMany({
      where: { ...membership, leftAt: null },
      data: { leftAt: at },
    });
    return count > 0;
  }

  private async tryCreate(create: () => Promise<unknown>): Promise<boolean> {
    try {
      await create();
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return false;
      }
      throw error;
    }
  }
}
