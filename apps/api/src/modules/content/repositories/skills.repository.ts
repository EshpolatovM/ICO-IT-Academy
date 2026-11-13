import { Injectable } from '@nestjs/common';

import { toSkipTake } from '../../../common/pagination/offset-pagination.util.js';
import { translateConstraintErrors } from '../../../infra/prisma/prisma-constraint.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import { ContentRepository } from './content-base.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { Prisma, Skill } from '../../../infra/prisma/generated/client.js';
import type { SkillRecord, SkillSearchCriteria } from '../content.types.js';

export interface SkillRepositoryTypes extends RepositoryTypes {
  model: Skill;
  where: Prisma.SkillWhereInput;
  create: Prisma.SkillCreateInput;
  update: Prisma.SkillUpdateInput;
  orderBy: Prisma.SkillOrderByWithRelationInput[];
}

const RECORD_SELECT = {
  id: true,
  name: true,
  icon: true,
  _count: { select: { topics: true } },
} as const satisfies Prisma.SkillSelect;

type RecordRow = Prisma.SkillGetPayload<{ select: typeof RECORD_SELECT }>;

function toRecord({ _count, ...row }: RecordRow): SkillRecord {
  return { ...row, topicsCount: _count.topics };
}

/** `skills` (docs/11 §3): nomi unique (`uq_skills_name`) — poygada `UniqueViolationError`. */
@Injectable()
export class SkillsRepository extends ContentRepository<SkillRepositoryTypes, SkillRecord> {
  protected readonly defaultOrderBy: SkillRepositoryTypes['orderBy'] = [
    { name: 'asc' },
    { id: 'asc' },
  ];
  protected readonly table = 'skills';

  protected get delegate(): PrismaService['client']['skill'] {
    return this.prisma.client.skill;
  }

  async search(criteria: SkillSearchCriteria): Promise<{ items: SkillRecord[]; total: number }> {
    const where: Prisma.SkillWhereInput =
      criteria.q === undefined ? {} : { name: { contains: criteria.q, mode: 'insensitive' } };
    const [rows, total] = await Promise.all([
      this.delegate.findMany({
        where,
        orderBy: this.defaultOrderBy,
        select: RECORD_SELECT,
        ...toSkipTake(criteria),
      }),
      this.delegate.count({ where }),
    ]);
    return { items: rows.map(toRecord), total };
  }

  async findRecord(id: string): Promise<SkillRecord | null> {
    const row = await this.delegate.findUnique({ where: { id }, select: RECORD_SELECT });
    return row ? toRecord(row) : null;
  }

  async isNameTaken(name: string, exceptId?: string): Promise<boolean> {
    const found = await this.delegate.findFirst({
      where: { name, ...(exceptId === undefined ? {} : { id: { not: exceptId } }) },
      select: { id: true },
    });
    return found !== null;
  }

  /** Berilganlar orasidan mavjud ko'nikmalar id'lari. */
  async findExistingIds(ids: readonly string[]): Promise<string[]> {
    const rows = await this.delegate.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  createSkill(data: { name: string; icon: string | null }): Promise<{ id: string }> {
    return translateConstraintErrors(() => this.delegate.create({ data, select: { id: true } }));
  }
}
