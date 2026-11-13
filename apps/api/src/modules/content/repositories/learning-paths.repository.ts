import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { translateConstraintErrors } from '../../../infra/prisma/prisma-constraint.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import { ContentRepository } from './content-base.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { LearningPath, Prisma } from '../../../infra/prisma/generated/client.js';
import type { NewPathData, PathItemRecord, PathRecord } from '../content.types.js';

export interface LearningPathRepositoryTypes extends RepositoryTypes {
  model: LearningPath;
  where: Prisma.LearningPathWhereInput;
  create: Prisma.LearningPathCreateInput;
  update: Prisma.LearningPathUpdateInput;
  orderBy: Prisma.LearningPathOrderByWithRelationInput[];
}

/** Guruhga biriktirish mumkin bo'lgan holatlar (R Q-6): `ARCHIVED` — yo'q. */
const ASSIGNABLE_STATUSES = [ContentStatus.DRAFT, ContentStatus.PUBLISHED];

const ITEM_SELECT = {
  id: true,
  title: true,
  slug: true,
  status: true,
  description: true,
  updatedAt: true,
  sections: { select: { _count: { select: { topics: true } } } },
} as const satisfies Prisma.LearningPathSelect;

/** O'chirilmagan guruhlar (nested `_count` soft delete extension bilan filtrlanmaydi). */
const DETAIL_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { groups: { where: { deletedAt: null } } } },
} as const satisfies Prisma.LearningPathSelect;

type ItemRow = Prisma.LearningPathGetPayload<{ select: typeof ITEM_SELECT }>;
type DetailRow = Prisma.LearningPathGetPayload<{ select: typeof DETAIL_SELECT }>;

function toItem({ sections, ...row }: ItemRow): PathItemRecord {
  const topicsCount = sections.reduce((sum, section) => sum + section._count.topics, 0);
  return { ...row, sectionsCount: sections.length, topicsCount };
}

function toRecord({ _count, ...row }: DetailRow): PathRecord {
  return { ...row, groupsCount: _count.groups };
}

/**
 * `learning_paths` (docs/11 §3): admin ro'yxati va tafsiloti, yaratish/o'zgartirish/o'chirish,
 * guruh yaratishda yo'lni tekshirish (`GroupsModule` ham ishlatadi). Yozuv/o'qish joriy
 * tranzaksiyada (`PrismaService.client`) — audit bilan bitta `UnitOfWork` da.
 */
@Injectable()
export class LearningPathsRepository extends ContentRepository<
  LearningPathRepositoryTypes,
  PathRecord
> {
  protected readonly defaultOrderBy: LearningPathRepositoryTypes['orderBy'] = [
    { title: 'asc' },
    { id: 'asc' },
  ];
  protected readonly table = 'learning_paths';

  /** Joriy tranzaksiya (yoki standart `db`) — meros metodlar ham `UnitOfWork` ga qo'shiladi. */
  protected get delegate(): PrismaService['client']['learningPath'] {
    return this.prisma.client.learningPath;
  }

  async listItems(status?: ContentStatus): Promise<PathItemRecord[]> {
    const rows = await this.delegate.findMany({
      where: { status },
      orderBy: this.defaultOrderBy,
      select: ITEM_SELECT,
    });
    return rows.map(toItem);
  }

  /** Mavjud va `ARCHIVED` emas (R Q-6: guruhga faqat `DRAFT`/`PUBLISHED` yo'l biriktiriladi). */
  async isAssignable(id: string): Promise<boolean> {
    const found = await this.delegate.findFirst({
      where: { id, status: { in: ASSIGNABLE_STATUSES } },
      select: { id: true },
    });
    return found !== null;
  }

  async findRecord(id: string): Promise<PathRecord | null> {
    const row = await this.delegate.findUnique({ where: { id }, select: DETAIL_SELECT });
    return row ? toRecord(row) : null;
  }

  async isSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
    const found = await this.delegate.findFirst({
      where: { slug, ...(exceptId === undefined ? {} : { id: { not: exceptId } }) },
      select: { id: true },
    });
    return found !== null;
  }

  /** Unique (`uq_learning_paths_slug`) poygada buzilsa — `UniqueViolationError`. */
  createPath(data: NewPathData): Promise<{ id: string }> {
    return translateConstraintErrors(() =>
      this.delegate.create({
        data: { ...data, status: ContentStatus.DRAFT },
        select: { id: true },
      }),
    );
  }
}
