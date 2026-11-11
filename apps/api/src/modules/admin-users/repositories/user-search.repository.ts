import { Injectable } from '@nestjs/common';

import { UserSort } from '@lms/shared';

import { toSkipTake } from '../../../common/pagination/offset-pagination.util.js';
import { Prisma } from '../../../infra/prisma/generated/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { UserSearchCriteria, UserSearchPage, UserSearchTerm } from '../admin-users.types.js';

/** Saralash — faqat oq ro'yxatdan (SQL'ga foydalanuvchi satri tushmaydi); `id` — barqaror tartib uchun. */
const ORDER_BY: Readonly<Record<UserSort, Prisma.Sql>> = {
  [UserSort.CREATED_AT_DESC]: Prisma.sql`u.created_at DESC, u.id DESC`,
  [UserSort.CREATED_AT_ASC]: Prisma.sql`u.created_at ASC, u.id ASC`,
  [UserSort.LAST_NAME_ASC]: Prisma.sql`lower(u.last_name) ASC, lower(u.first_name) ASC, u.id ASC`,
  [UserSort.LAST_NAME_DESC]: Prisma.sql`lower(u.last_name) DESC, lower(u.first_name) DESC, u.id DESC`,
};

/**
 * Ism-familiya: ifoda `idx_users_full_name_trgm` (GIN, pg_trgm) indeksi bilan AYNAN bir xil
 * bo'lishi shart — shunda `LIKE '%...%'` indeksdan foydalanadi (docs/11 §1).
 */
function searchCondition(term: UserSearchTerm): Prisma.Sql {
  const alternatives = [
    Prisma.sql`lower(u.first_name || ' ' || u.last_name) LIKE ${term.namePattern}`,
  ];
  if (term.studentCode !== null) {
    alternatives.push(Prisma.sql`u.student_code = ${term.studentCode}`);
  }
  if (term.phonePattern !== null) {
    alternatives.push(Prisma.sql`u.phone LIKE ${term.phonePattern}`);
  }
  return Prisma.sql`(${Prisma.join(alternatives, ' OR ')})`;
}

function whereClause(criteria: UserSearchCriteria): Prisma.Sql {
  const conditions = [
    Prisma.sql`u.deleted_at IS NULL`,
    Prisma.sql`u.role = ${criteria.role}::"Role"`,
  ];
  if (criteria.status !== undefined) {
    conditions.push(Prisma.sql`u.status = ${criteria.status}::"UserStatus"`);
  }
  if (criteria.groupId !== undefined) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.student_id = u.id AND gm.left_at IS NULL AND gm.group_id = ${criteria.groupId}::uuid)`);
  }
  if (criteria.search !== null) {
    conditions.push(searchCondition(criteria.search));
  }
  return Prisma.join(conditions, ' AND ');
}

/**
 * Admin jadvallari uchun foydalanuvchilar qidiruvi (docs/12 §0 offset pagination). Xom SQL:
 * Prisma `contains` pg_trgm ifoda-indeksidan foydalana olmaydi. Bu yerda faqat id'lar va jami
 * soni; to'liq yozuvlar — `UserAccountsRepository.findAccountsByIds`.
 * `BaseRepository` dan meros olmaydi: model CRUD emas, faqat o'qish so'rovi.
 */
@Injectable()
export class UserSearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(criteria: UserSearchCriteria): Promise<UserSearchPage> {
    const where = whereClause(criteria);
    const { skip, take } = toSkipTake(criteria);
    const [rows, counts] = await Promise.all([
      this.prisma.db.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT u.id FROM users u WHERE ${where}
        ORDER BY ${ORDER_BY[criteria.sort]} LIMIT ${take} OFFSET ${skip}`),
      this.prisma.db.$queryRaw<{ total: number }[]>(Prisma.sql`
        SELECT count(*)::int AS total FROM users u WHERE ${where}`),
    ]);
    return { ids: rows.map((row) => row.id), total: counts[0]?.total ?? 0 };
  }
}
