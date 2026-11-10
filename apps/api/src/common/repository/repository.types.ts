import type { OffsetPaginationQuery, PaginatedResult } from '@lms/shared';

/** Repository modeliga oid tiplar to'plami (Prisma'dan: `User`, `Prisma.UserWhereInput`, ...). */
export interface RepositoryTypes {
  model: unknown;
  where: unknown;
  create: unknown;
  update: unknown;
  orderBy: unknown;
}

/**
 * Prisma model delegate'ining (`prisma.user`, ...) BaseRepository ishlatadigan qismi.
 * Strukturaviy interfeys — `common/` Prisma'ga bog'lanmaydi, testda soxta delegate beriladi.
 */
export interface ModelDelegate<T extends RepositoryTypes> {
  findUnique(args: { where: { id: string } }): PromiseLike<T['model'] | null>;
  findMany(args: {
    where?: T['where'];
    orderBy?: T['orderBy'];
    skip: number;
    take: number;
  }): PromiseLike<T['model'][]>;
  count(args: { where?: T['where'] }): PromiseLike<number>;
  create(args: { data: T['create'] }): PromiseLike<T['model']>;
  update(args: { where: { id: string }; data: T['update'] }): PromiseLike<T['model']>;
}

/** Soft delete'li model delegate'i: `deleted_at` ni yozish imkoniyati (docs/11 §0). */
export interface SoftDeleteDelegate<T extends RepositoryTypes> extends ModelDelegate<T> {
  update(args: {
    where: { id: string };
    data: T['update'] | { deletedAt: Date };
  }): PromiseLike<T['model']>;
}

export interface Repository<T extends RepositoryTypes> {
  findById(id: string): Promise<T['model'] | null>;
  findMany(
    pagination: OffsetPaginationQuery,
    where?: T['where'],
  ): Promise<PaginatedResult<T['model']>>;
  create(data: T['create']): Promise<T['model']>;
  update(id: string, data: T['update']): Promise<T['model']>;
}

export interface SoftDeletableRepository<T extends RepositoryTypes> extends Repository<T> {
  softDelete(id: string): Promise<T['model']>;
}
