import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { Prisma } from '../../../infra/prisma/generated/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import { OrderedContentRepository } from './ordered-content.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { Topic } from '../../../infra/prisma/generated/client.js';
import type { NewNodeData, TopicChanges, TopicFields, TopicRecord } from '../content.types.js';

export interface TopicRepositoryTypes extends RepositoryTypes {
  model: Topic;
  where: Prisma.TopicWhereInput;
  create: Prisma.TopicUncheckedCreateInput;
  update: Prisma.TopicUpdateInput;
  orderBy: Prisma.TopicOrderByWithRelationInput[];
}

const RECORD_SELECT = {
  id: true,
  sectionId: true,
  title: true,
  description: true,
  icon: true,
  status: true,
  section: { select: { pathId: true } },
} as const satisfies Prisma.TopicSelect;

/** `topics` (docs/11 §3): ota — bo'lim. */
@Injectable()
export class TopicsRepository extends OrderedContentRepository<
  TopicRepositoryTypes,
  TopicRecord,
  TopicFields,
  TopicChanges
> {
  protected readonly defaultOrderBy: TopicRepositoryTypes['orderBy'] = [
    { order: 'asc' },
    { id: 'asc' },
  ];
  protected readonly table = 'topics';
  protected readonly parentColumn = 'section_id';

  protected get delegate(): PrismaService['client']['topic'] {
    return this.prisma.client.topic;
  }

  protected lockParentQuery(sectionId: string): Prisma.Sql {
    return Prisma.sql`SELECT path_id FROM path_sections WHERE id = ${sectionId}::uuid FOR UPDATE`;
  }

  async findRecord(id: string): Promise<TopicRecord | null> {
    const row = await this.delegate.findUnique({ where: { id }, select: RECORD_SELECT });
    if (!row) {
      return null;
    }
    const { section, sectionId, ...fields } = row;
    return { ...fields, parentId: sectionId, pathId: section.pathId };
  }

  createNode({ parentId, order, fields }: NewNodeData<TopicFields>): Promise<{ id: string }> {
    return this.delegate.create({
      data: { ...fields, sectionId: parentId, order, status: ContentStatus.DRAFT },
      select: { id: true },
    });
  }
}
