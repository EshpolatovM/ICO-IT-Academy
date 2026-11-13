import { Injectable } from '@nestjs/common';

import { ConcurrentModificationError } from '../../../common/exceptions/concurrent-modification.error.js';
import { Prisma } from '../../../infra/prisma/generated/client.js';

import { ContentRepository, identifier } from './content-base.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { NewNodeData } from '../content.types.js';

/** `ContentOrderService` ishlatadigan qism (bo'lim, mavzu, dars uchun bir xil). */
export interface OrderedChildren {
  lockParent(parentId: string): Promise<string | null>;
  childIds(parentId: string): Promise<string[]>;
  reorder(parentId: string, ids: readonly string[]): Promise<void>;
}

/** Bo'lim/mavzu/dars servislari ishlatadigan qism (`ContentNodeService`). */
export interface ContentNodeStore<TRecord, TFields, TChanges> {
  lockParent(parentId: string): Promise<string | null>;
  findRecord(id: string): Promise<TRecord | null>;
  lockRecord(id: string): Promise<TRecord | null>;
  nextOrder(parentId: string): Promise<number>;
  createNode(data: NewNodeData<TFields>): Promise<{ id: string }>;
  applyChanges(id: string, changes: TChanges): Promise<void>;
  deleteById(id: string): Promise<void>;
}

/**
 * Bo'lim, mavzu va dars repository'lari uchun umumiy qism (3.2 §3.4): ota qatorini qulflash
 * (yaratish/tartiblashda `order` poygasi yo'q), oxirgi `order`, bolalar ro'yxati va bitta
 * statementli qayta tartiblash. `(parent, "order")` unique — DEFERRABLE INITIALLY IMMEDIATE,
 * statement oxirida tekshiriladi (`SET CONSTRAINTS` shart emas).
 * `@Injectable` — konstruktor metadata'si (`PrismaService`) merosxo'rlarga o'tadi.
 */
@Injectable()
export abstract class OrderedContentRepository<
  T extends RepositoryTypes,
  TRecord,
  TFields,
  TChanges extends T['update'],
>
  extends ContentRepository<T, TRecord>
  implements OrderedChildren, ContentNodeStore<TRecord, TFields, TChanges>
{
  /** Ota ustuni (`path_sections.path_id` va h.k.). */
  protected abstract readonly parentColumn: string;

  abstract createNode(data: NewNodeData<TFields>): Promise<{ id: string }>;

  /** Ota qatorini qulflash so'rovi: natijada bitta `path_id` ustuni. */
  protected abstract lockParentQuery(parentId: string): Prisma.Sql;

  /** Ota qatorini qulflaydi va yo'l id'sini qaytaradi; ota yo'q — `null`. */
  async lockParent(parentId: string): Promise<string | null> {
    const rows = await this.prisma.client.$queryRaw<{ path_id: string }[]>(
      this.lockParentQuery(parentId),
    );
    return rows[0]?.path_id ?? null;
  }

  /** Oxiriga qo'shish uchun tartib: `COALESCE(MAX("order"), 0) + 1` (ota qulfi ostida). */
  async nextOrder(parentId: string): Promise<number> {
    const { table, parentColumn } = this;
    const rows = await this.prisma.client.$queryRaw<{ next: number }[]>`SELECT
      COALESCE(MAX("order"), 0) + 1 AS next FROM ${identifier(table)}
      WHERE ${identifier(parentColumn)} = ${parentId}::uuid`;
    return Number(rows[0]?.next);
  }

  /** Otaning barcha bolalari (barcha holatlar), joriy tartibda. */
  async childIds(parentId: string): Promise<string[]> {
    const { table, parentColumn } = this;
    const rows = await this.prisma.client.$queryRaw<{ id: string }[]>`SELECT id
      FROM ${identifier(table)} WHERE ${identifier(parentColumn)} = ${parentId}::uuid
      ORDER BY "order", id`;
    return rows.map((row) => row.id);
  }

  /**
   * Bitta statement: `order = 1…n` (`ids` tartibida). Yangilangan qatorlar soni mos kelmasa
   * (parallel o'chirish) — `ConcurrentModificationError`, tranzaksiya bekor qilinadi.
   */
  async reorder(parentId: string, ids: readonly string[]): Promise<void> {
    const { table, parentColumn } = this;
    const values = Prisma.join(
      ids.map((id, index) => Prisma.sql`(${id}::uuid, ${index + 1}::int)`),
    );
    const updated = await this.prisma.client.$executeRaw`UPDATE ${identifier(table)} AS t
      SET "order" = v.ord FROM (VALUES ${values}) AS v(id, ord)
      WHERE t.id = v.id AND t.${identifier(parentColumn)} = ${parentId}::uuid`;
    if (updated !== ids.length) {
      throw new ConcurrentModificationError(
        `Qayta tartiblash: ${String(ids.length)} o'rniga ${String(updated)} qator`,
      );
    }
  }
}
