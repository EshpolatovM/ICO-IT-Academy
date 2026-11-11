import type { OffsetPaginationQuery, PaginatedResult } from '@lms/shared';

import { toSkipTake } from '../pagination/offset-pagination.util.js';

import type {
  ModelDelegate,
  Repository,
  RepositoryTypes,
  SoftDeletableRepository,
  SoftDeleteDelegate,
} from './repository.types.js';

/**
 * Umumiy CRUD va offset pagination (docs/12 §0: `{ items, total, page, pageSize }`).
 * Merosxo'r faqat `delegate` (masalan `prisma.db.user`) va `defaultOrderBy` ni beradi.
 * Soft delete'li modellar uchun — `SoftDeletableBaseRepository`.
 */
export abstract class BaseRepository<T extends RepositoryTypes> implements Repository<T> {
  protected abstract readonly delegate: ModelDelegate<T>;
  /** Pagination barqaror bo'lishi uchun tartib majburiy. */
  protected abstract readonly defaultOrderBy: T['orderBy'];

  async findById(id: string): Promise<T['model'] | null> {
    return this.delegate.findUnique({ where: { id } });
  }

  async findMany(
    pagination: OffsetPaginationQuery,
    where?: T['where'],
  ): Promise<PaginatedResult<T['model']>> {
    const [items, total] = await Promise.all([
      this.delegate.findMany({ where, orderBy: this.defaultOrderBy, ...toSkipTake(pagination) }),
      this.delegate.count({ where }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async create(data: T['create']): Promise<T['model']> {
    return this.delegate.create({ data });
  }

  async update(id: string, data: T['update']): Promise<T['model']> {
    return this.delegate.update({ where: { id }, data });
  }
}

/**
 * Soft delete'li modellar (users, groups, blog — docs/11 §0) uchun: `softDelete` `deleted_at` ni
 * yozadi; o'qishda o'chirilganlar Prisma extension orqali avtomatik yashiriladi.
 */
export abstract class SoftDeletableBaseRepository<T extends RepositoryTypes>
  extends BaseRepository<T>
  implements SoftDeletableRepository<T>
{
  protected abstract override readonly delegate: SoftDeleteDelegate<T>;

  async softDelete(id: string): Promise<T['model']> {
    return this.delegate.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
