import { Injectable } from '@nestjs/common';

import { chestRewardSchema } from '@lms/shared';

import { translateConstraintErrors } from '../../../infra/prisma/prisma-constraint.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import { ContentRepository } from './content-base.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { PathChest, Prisma } from '../../../infra/prisma/generated/client.js';
import type { ChestRecord, NewChestData } from '../content.types.js';

export interface PathChestRepositoryTypes extends RepositoryTypes {
  model: PathChest;
  where: Prisma.PathChestWhereInput;
  create: Prisma.PathChestUncheckedCreateInput;
  update: Prisma.PathChestUncheckedUpdateInput;
  orderBy: Prisma.PathChestOrderByWithRelationInput[];
}

const RECORD_SELECT = {
  id: true,
  sectionId: true,
  afterTopicId: true,
  title: true,
  reward: true,
  section: { select: { pathId: true } },
} as const satisfies Prisma.PathChestSelect;

type RecordRow = Prisma.PathChestGetPayload<{ select: typeof RECORD_SELECT }>;

/** `reward` (jsonb) faqat API/seed sxemasi orqali yoziladi — o'qishda ham shu sxema. */
function toRecord({ section, reward, ...row }: RecordRow): ChestRecord {
  return { ...row, pathId: section.pathId, reward: chestRewardSchema.parse(reward) };
}

/**
 * `path_chests` (docs/11 §3): bitta mavzudan keyin bitta sandiq (`uq_path_chests_after_topic_id`);
 * poygada buzilsa — `UniqueViolationError`. 3-modulda mukofot faqat saqlanadi.
 */
@Injectable()
export class PathChestsRepository extends ContentRepository<PathChestRepositoryTypes, ChestRecord> {
  protected readonly defaultOrderBy: PathChestRepositoryTypes['orderBy'] = [{ id: 'asc' }];
  protected readonly table = 'path_chests';

  protected get delegate(): PrismaService['client']['pathChest'] {
    return this.prisma.client.pathChest;
  }

  async findRecord(id: string): Promise<ChestRecord | null> {
    const row = await this.delegate.findUnique({ where: { id }, select: RECORD_SELECT });
    return row ? toRecord(row) : null;
  }

  /** Mavzudan keyingi sandiq id'si (yo'q — `null`). */
  async findIdByAfterTopic(topicId: string): Promise<string | null> {
    const row = await this.delegate.findUnique({
      where: { afterTopicId: topicId },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  createChest(data: NewChestData): Promise<{ id: string }> {
    return translateConstraintErrors(() => this.delegate.create({ data, select: { id: true } }));
  }
}
