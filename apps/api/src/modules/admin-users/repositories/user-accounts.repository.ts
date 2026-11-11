import { Injectable } from '@nestjs/common';

import { Role, UserStatus } from '@lms/shared';

import { SoftDeletableBaseRepository } from '../../../common/repository/base.repository.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { StudentCodeRepository } from '../../users/repositories/student-code.repository.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';
import type { UserRepositoryTypes } from '../../users/repositories/users.repository.js';
import type {
  AccountChanges,
  CreatedStudentRecord,
  NewStaffData,
  NewStudentData,
  UserAccountRecord,
} from '../admin-users.types.js';

const GROUP_REF_SELECT = { id: true, name: true } as const satisfies Prisma.GroupSelect;

/** `UserAccountRecord` uchun ustunlar (parol hash'i va `token_version` tashqariga chiqmaydi). */
const ACCOUNT_SELECT = {
  id: true,
  role: true,
  phone: true,
  studentCode: true,
  firstName: true,
  lastName: true,
  status: true,
  mustChangePassword: true,
  bio: true,
  lastLoginAt: true,
  createdAt: true,
  // Nested yozuvlar soft delete extension bilan filtrlanmaydi — `deletedAt: null` aniq yoziladi.
  mentoredGroups: {
    where: { deletedAt: null, status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: GROUP_REF_SELECT,
  },
  groupMemberships: {
    where: { leftAt: null, group: { deletedAt: null } },
    take: 1,
    select: { group: { select: GROUP_REF_SELECT } },
  },
} as const satisfies Prisma.UserSelect;

type AccountRow = Prisma.UserGetPayload<{ select: typeof ACCOUNT_SELECT }>;

function toRecord({ groupMemberships, ...row }: AccountRow): UserAccountRecord {
  return { ...row, activeGroup: groupMemberships[0]?.group ?? null };
}

/** Yangi akkaunt: vaqtinchalik yoki admin bergan parol — birinchi kirishda almashtiriladi (docs/02 §2). */
const NEW_ACCOUNT_DEFAULTS = {
  mustChangePassword: true,
  status: UserStatus.ACTIVE,
} as const;

/**
 * `users` jadvali — admin boshqaruvi uchun (docs/12 §2): yaratish, o'zgartirish, deaktivatsiya.
 * Yozuvlar joriy tranzaksiyaga qo'shiladi (`PrismaService.client`) — audit bilan bitta `UnitOfWork`.
 * Ro'yxat qidiruvi — `UserSearchRepository` (pg_trgm, xom SQL).
 */
@Injectable()
export class UserAccountsRepository extends SoftDeletableBaseRepository<UserRepositoryTypes> {
  protected readonly delegate: PrismaService['db']['user'];
  protected readonly defaultOrderBy = { createdAt: 'desc' } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly studentCodes: StudentCodeRepository,
  ) {
    super();
    this.delegate = prisma.db.user;
  }

  async findAccount(id: string): Promise<UserAccountRecord | null> {
    const row = await this.prisma.client.user.findUnique({ where: { id }, select: ACCOUNT_SELECT });
    return row ? toRecord(row) : null;
  }

  /** Berilgan id'lar tartibida (topilmaganlari tashlab ketiladi). */
  async findAccountsByIds(ids: readonly string[]): Promise<UserAccountRecord[]> {
    const rows = await this.delegate.findMany({
      where: { id: { in: [...ids] } },
      select: ACCOUNT_SELECT,
    });
    const byId = new Map(rows.map((row) => [row.id, toRecord(row)]));
    return ids.flatMap((id) => byId.get(id) ?? []);
  }

  /** Telefon band-mi (o'chirilganlar ham — unique `uq_users_phone` ularni ham qamraydi). */
  async isPhoneTaken(phone: string, exceptUserId?: string): Promise<boolean> {
    const found = await this.prisma.dbIncludingDeleted.user.findFirst({
      where: { phone, ...(exceptUserId === undefined ? {} : { id: { not: exceptUserId } }) },
      select: { id: true },
    });
    return found !== null;
  }

  async createStaff(data: NewStaffData): Promise<{ id: string }> {
    return this.prisma.client.user.create({
      data: { ...data, ...NEW_ACCOUNT_DEFAULTS },
      select: { id: true },
    });
  }

  /** Student kodi `student_code_seq` dan — shu tranzaksiyada (docs/02 §2). */
  async createStudent(data: NewStudentData): Promise<CreatedStudentRecord> {
    const client = this.prisma.client;
    const studentCode = await this.studentCodes.next(client);
    return this.createStudentRow(client, { ...data, studentCode });
  }

  /** Bir nechta student (CSV import): kodlar bitta so'rovda, natija kirish tartibida. */
  async createStudents(data: readonly NewStudentData[]): Promise<CreatedStudentRecord[]> {
    const client = this.prisma.client;
    const codes = await this.studentCodes.nextMany(client, data.length);
    const rows = await client.user.createManyAndReturn({
      data: data.map((student, index) => ({
        ...student,
        ...NEW_ACCOUNT_DEFAULTS,
        role: Role.STUDENT,
        studentCode: codes[index] ?? null,
      })),
      select: { id: true, studentCode: true },
    });
    const byCode = new Map(rows.map((row) => [row.studentCode, row.id]));
    return codes.map((studentCode) => ({ id: byCode.get(studentCode) ?? '', studentCode }));
  }

  /**
   * O'zgarishlarni yozadi. Deaktivatsiyada (docs/02 §6) — shu yozuvning o'zida `token_version++`
   * va barcha faol refresh tokenlar bekor (eski access/refresh darhol 401).
   */
  applyChanges(id: string, changes: AccountChanges, at: Date): Promise<{ tokenVersion: number }> {
    const deactivating = changes.status === UserStatus.INACTIVE;
    return this.prisma.client.user.update({
      where: { id },
      data: {
        ...changes,
        ...(deactivating
          ? {
              tokenVersion: { increment: 1 },
              refreshTokens: {
                updateMany: { where: { revokedAt: null }, data: { revokedAt: at } },
              },
            }
          : {}),
      },
      select: { tokenVersion: true },
    });
  }

  private async createStudentRow(
    client: PrismaService['client'],
    data: NewStudentData & { studentCode: string },
  ): Promise<CreatedStudentRecord> {
    const row = await client.user.create({
      data: { ...data, ...NEW_ACCOUNT_DEFAULTS, role: Role.STUDENT },
      select: { id: true, studentCode: true },
    });
    return { id: row.id, studentCode: row.studentCode ?? data.studentCode };
  }
}
