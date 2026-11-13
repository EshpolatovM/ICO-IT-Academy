import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { Prisma } from '../../../infra/prisma/generated/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import { OrderedContentRepository } from './ordered-content.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { Lesson } from '../../../infra/prisma/generated/client.js';
import type {
  LessonChanges,
  LessonDetailRecord,
  LessonFields,
  LessonRecord,
  NewNodeData,
} from '../content.types.js';

export interface LessonRepositoryTypes extends RepositoryTypes {
  model: Lesson;
  where: Prisma.LessonWhereInput;
  create: Prisma.LessonUncheckedCreateInput;
  update: Prisma.LessonUpdateInput;
  orderBy: Prisma.LessonOrderByWithRelationInput[];
}

/** Yo'lgacha ko'tarilish (`lesson → topic → section → path`) — bitta so'rovda. */
const DETAIL_SELECT = {
  id: true,
  topicId: true,
  order: true,
  title: true,
  contentMd: true,
  videoUrl: true,
  estMinutes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  topic: {
    select: {
      id: true,
      title: true,
      section: { select: { path: { select: { id: true, title: true } } } },
    },
  },
} as const satisfies Prisma.LessonSelect;

/** `lessons` (docs/11 §3): ota — mavzu. */
@Injectable()
export class LessonsRepository extends OrderedContentRepository<
  LessonRepositoryTypes,
  LessonRecord,
  LessonFields,
  LessonChanges
> {
  protected readonly defaultOrderBy: LessonRepositoryTypes['orderBy'] = [
    { order: 'asc' },
    { id: 'asc' },
  ];
  protected readonly table = 'lessons';
  protected readonly parentColumn = 'topic_id';

  protected get delegate(): PrismaService['client']['lesson'] {
    return this.prisma.client.lesson;
  }

  protected lockParentQuery(topicId: string): Prisma.Sql {
    return Prisma.sql`SELECT s.path_id FROM topics t JOIN path_sections s ON s.id = t.section_id
      WHERE t.id = ${topicId}::uuid FOR UPDATE OF t`;
  }

  findRecord(id: string): Promise<LessonRecord | null> {
    return this.findDetail(id);
  }

  async findDetail(id: string): Promise<LessonDetailRecord | null> {
    const row = await this.delegate.findUnique({ where: { id }, select: DETAIL_SELECT });
    if (!row) {
      return null;
    }
    const { topic, topicId, ...fields } = row;
    const { path } = topic.section;
    return {
      ...fields,
      parentId: topicId,
      pathId: path.id,
      topic: { id: topic.id, title: topic.title },
      path,
    };
  }

  createNode({ parentId, order, fields }: NewNodeData<LessonFields>): Promise<{ id: string }> {
    return this.delegate.create({
      data: { ...fields, topicId: parentId, order, status: ContentStatus.DRAFT },
      select: { id: true },
    });
  }
}
