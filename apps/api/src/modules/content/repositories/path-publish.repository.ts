import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { PublishedCounts } from '../content.types.js';

const DRAFT_TO_PUBLISHED = {
  where: { status: ContentStatus.DRAFT },
  data: { status: ContentStatus.PUBLISHED },
} as const;
const NOT_ARCHIVED = { not: ContentStatus.ARCHIVED };

/**
 * Kaskadli nashr (R Q-3, Domla 🟡-5): yo'l ostidagi `DRAFT` bo'lim/mavzu/darslar `→ PUBLISHED`,
 * har daraja uchun bitta `UPDATE` (N+1 yo'q). Faqat `ARCHIVED` bo'lmagan ota orqali tushadi;
 * `ARCHIVED` lar tegilmaydi. Chaqiruvchining tranzaksiyasida (yo'l qulfi ostida).
 */
@Injectable()
export class PathPublishRepository {
  constructor(private readonly prisma: PrismaService) {}

  async publishDrafts(pathId: string): Promise<PublishedCounts> {
    const client = this.prisma.client;
    const sections = await client.pathSection.updateMany({
      where: { ...DRAFT_TO_PUBLISHED.where, pathId },
      data: DRAFT_TO_PUBLISHED.data,
    });
    const topics = await client.topic.updateMany({
      where: { ...DRAFT_TO_PUBLISHED.where, section: { pathId, status: NOT_ARCHIVED } },
      data: DRAFT_TO_PUBLISHED.data,
    });
    const lessons = await client.lesson.updateMany({
      where: {
        ...DRAFT_TO_PUBLISHED.where,
        topic: { status: NOT_ARCHIVED, section: { pathId, status: NOT_ARCHIVED } },
      },
      data: DRAFT_TO_PUBLISHED.data,
    });
    return { sections: sections.count, topics: topics.count, lessons: lessons.count };
  }
}
