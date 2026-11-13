import { Injectable } from '@nestjs/common';

import { BaseRepository } from '../../../common/repository/base.repository.js';
import { Prisma } from '../../../infra/prisma/generated/client.js';
import { translateConstraintErrors } from '../../../infra/prisma/prisma-constraint.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type {
  ModelDelegate,
  RepositoryTypes,
} from '../../../common/repository/repository.types.js';

/** Kontent jadvallari (raw SQL qulf/tartib so'rovlari faqat shular bilan). */
export type ContentTable =
  'learning_paths' | 'path_sections' | 'topics' | 'lessons' | 'path_chests' | 'skills';

/** Raw SQL identifikatori — faqat kod ichidagi konstantalar (foydalanuvchi qiymati emas). */
export function identifier(name: string): Prisma.Sql {
  return Prisma.raw(`"${name}"`);
}

/** Kontent delegate'i: umumiy CRUD + o'chirish. */
export interface ContentDelegate<T extends RepositoryTypes> extends ModelDelegate<T> {
  delete(args: { where: { id: string } }): PromiseLike<unknown>;
}

/**
 * Kontent repository'lari uchun umumiy amallar: qatorni qulflab o'qish va yozuv. Cheklov
 * buzilishlari domen xatosi sifatida tashlanadi (servis aniq javob shakliga o'giradi): unique (slug,
 * ko'nikma nomi, sandiq mavzusi) — `UniqueViolationError`, FK `Restrict` (guruh, enrollment,
 * progress) — `ForeignKeyViolationError`. Hamma amal joriy tranzaksiyada (`PrismaService.client`).
 */
@Injectable()
export abstract class ContentRepository<
  T extends RepositoryTypes,
  TRecord,
> extends BaseRepository<T> {
  protected abstract override readonly delegate: ContentDelegate<T>;
  protected abstract readonly table: ContentTable;

  constructor(protected readonly prisma: PrismaService) {
    super();
  }

  abstract findRecord(id: string): Promise<TRecord | null>;

  /**
   * Qatorni joriy tranzaksiya oxirigacha qulflab o'qiydi (`SELECT … FOR UPDATE`; PATCH diff'i,
   * nashr, o'chirish ketma-ket). Faqat `UnitOfWork` ichida ma'noli. Yo'q — `null`.
   */
  async lockRecord(id: string): Promise<TRecord | null> {
    const rows = await this.prisma.client.$queryRaw<{ id: string }[]>`SELECT id
      FROM ${identifier(this.table)} WHERE id = ${id}::uuid FOR UPDATE`;
    return rows.length === 0 ? null : this.findRecord(id);
  }

  async applyChanges(id: string, changes: T['update']): Promise<void> {
    await translateConstraintErrors(() => this.delegate.update({ where: { id }, data: changes }));
  }

  /** Bolalar (`onDelete: Cascade`) bilan birga o'chiradi. */
  async deleteById(id: string): Promise<void> {
    await translateConstraintErrors(() => this.delegate.delete({ where: { id } }));
  }
}
