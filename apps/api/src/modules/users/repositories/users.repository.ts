import { Injectable } from '@nestjs/common';

import { Role } from '@lms/shared';

import { STAFF_ROLES } from '../../../common/constants/roles.constants.js';
import { SoftDeletableBaseRepository } from '../../../common/repository/base.repository.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { ACTIVE_GROUP_MEMBERSHIP_SELECT } from '../../groups/repositories/group-members.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { Prisma, User } from '../../../infra/prisma/generated/client.js';
import type {
  PasswordChangeResult,
  StudentChildRecord,
  StudentProfileRecord,
  UserAuthRecord,
} from '../users.types.js';

export interface UserRepositoryTypes extends RepositoryTypes {
  model: User;
  where: Prisma.UserWhereInput;
  create: Prisma.UserCreateInput;
  update: Prisma.UserUpdateInput;
  orderBy: Prisma.UserOrderByWithRelationInput;
}

/** Auth uchun tanlanadigan ustunlar — `UserAuthRecord` bilan bir xil. */
const AUTH_SELECT = {
  id: true,
  role: true,
  phone: true,
  studentCode: true,
  passwordHash: true,
  mustChangePassword: true,
  tokenVersion: true,
  firstName: true,
  lastName: true,
  status: true,
} as const satisfies Prisma.UserSelect;

export interface PasswordChangeData {
  passwordHash: string;
  /** Shu vaqt bilan foydalanuvchining barcha faol refresh tokenlari bekor qilinadi. */
  revokedAt: Date;
}

const STUDENT_PROFILE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
} as const satisfies Prisma.UserSelect;

/** `users` jadvali. O'chirilgan (soft delete) foydalanuvchilar avtomatik yashiriladi. */
@Injectable()
export class UsersRepository extends SoftDeletableBaseRepository<UserRepositoryTypes> {
  protected readonly defaultOrderBy = { createdAt: 'desc' } as const;

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** Joriy tranzaksiya (yoki standart `db`) — meros metodlar ham `UnitOfWork` ga qo'shiladi. */
  protected get delegate(): PrismaService['client']['user'] {
    return this.prisma.client.user;
  }

  /** Staff (SA, A, M) — telefon bo'yicha (docs/02 §4.1). */
  findStaffByPhone(phone: string): Promise<UserAuthRecord | null> {
    return this.delegate.findFirst({
      where: { phone, role: { in: [...STAFF_ROLES] } },
      select: AUTH_SELECT,
    });
  }

  /** Student — `student_code` bo'yicha (docs/02 §4.2). */
  findStudentByCode(studentCode: string): Promise<UserAuthRecord | null> {
    return this.delegate.findFirst({
      where: { studentCode, role: Role.STUDENT },
      select: AUTH_SELECT,
    });
  }

  findAuthById(id: string): Promise<UserAuthRecord | null> {
    return this.delegate.findUnique({ where: { id }, select: AUTH_SELECT });
  }

  /** Faqat faol (o'chirilmagan) foydalanuvchi uchun `token_version`; topilmasa — `null`. */
  async findTokenVersion(id: string): Promise<number | null> {
    const user = await this.delegate.findUnique({ where: { id }, select: { tokenVersion: true } });
    return user?.tokenVersion ?? null;
  }

  async markLoggedIn(id: string, at: Date): Promise<void> {
    await this.delegate.update({ where: { id }, data: { lastLoginAt: at }, select: { id: true } });
  }

  /** Student (o'chirilmagan, istalgan holatda) — topilmasa yoki student bo'lmasa `null`. */
  findStudent(id: string): Promise<StudentProfileRecord | null> {
    return this.delegate.findFirst({
      where: { id, role: Role.STUDENT },
      select: STUDENT_PROFILE_SELECT,
    });
  }

  /** Ota-ona paneli uchun: farzandlar va ularning faol guruhi nomi. */
  async findChildrenByIds(ids: readonly string[]): Promise<StudentChildRecord[]> {
    const rows = await this.delegate.findMany({
      where: { id: { in: [...ids] }, role: Role.STUDENT },
      orderBy: this.defaultOrderBy,
      select: { ...STUDENT_PROFILE_SELECT, groupMemberships: ACTIVE_GROUP_MEMBERSHIP_SELECT },
    });
    return rows.map(({ groupMemberships, ...student }) => ({
      ...student,
      groupName: groupMemberships[0]?.group.name ?? null,
    }));
  }

  /**
   * Parolni almashtirish — bitta atomar yozuvda (docs/02 §4.2): yangi hash,
   * `must_change_password = false`, `token_version++` va barcha faol refresh tokenlar bekor.
   */
  changePassword(id: string, data: PasswordChangeData): Promise<PasswordChangeResult> {
    return this.replacePassword(id, data, false);
  }

  /** Parolni tiklash (docs/02 §4.3): xuddi shunday, lekin `must_change_password = true`. */
  resetPassword(id: string, data: PasswordChangeData): Promise<PasswordChangeResult> {
    return this.replacePassword(id, data, true);
  }

  /** Joriy tranzaksiyaga qo'shiladi (`PrismaService.client`) — tiklash audit bilan bitta `UnitOfWork` da. */
  private replacePassword(
    id: string,
    data: PasswordChangeData,
    mustChangePassword: boolean,
  ): Promise<PasswordChangeResult> {
    return this.prisma.client.user.update({
      where: { id },
      data: {
        passwordHash: data.passwordHash,
        mustChangePassword,
        tokenVersion: { increment: 1 },
        refreshTokens: {
          updateMany: { where: { revokedAt: null }, data: { revokedAt: data.revokedAt } },
        },
      },
      select: { tokenVersion: true },
    });
  }
}
