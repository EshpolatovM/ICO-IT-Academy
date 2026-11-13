import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';
import type { PathUsage } from '../content.types.js';

/** Progress tekshiriladigan kontent darajasi (ichidagilari bilan). */
export const ProgressScope = {
  SECTION: 'SECTION',
  TOPIC: 'TOPIC',
  LESSON: 'LESSON',
} as const;
export type ProgressScope = (typeof ProgressScope)[keyof typeof ProgressScope];

function topicWhere(scope: ProgressScope, id: string): Prisma.TopicWhereInput | null {
  if (scope === ProgressScope.SECTION) {
    return { sectionId: id };
  }
  return scope === ProgressScope.TOPIC ? { id } : null;
}

function lessonWhere(scope: ProgressScope, id: string): Prisma.LessonWhereInput {
  const topic = topicWhere(scope, id);
  return topic === null ? { id } : { topic };
}

/**
 * Kontentni o'chirishdan oldingi tekshiruvlar (3.2 §4 p.6): faqat mavjudlik (`EXISTS`/`LIMIT 1`).
 * Progress va enrollment kontentga `Restrict` — servis aniq `reason` berishi uchun oldindan.
 */
@Injectable()
export class ContentProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Bo'lim/mavzu/dars (ichidagilari bilan) bo'yicha `lesson_progress` yoki `topic_progress` bormi. */
  async hasProgress(scope: ProgressScope, id: string): Promise<boolean> {
    const client = this.prisma.client;
    const lesson = await client.lessonProgress.findFirst({
      where: { lesson: lessonWhere(scope, id) },
      select: { lessonId: true },
    });
    if (lesson !== null) {
      return true;
    }
    const topic = topicWhere(scope, id);
    if (topic === null) {
      return false;
    }
    const found = await client.topicProgress.findFirst({
      where: { topic },
      select: { topicId: true },
    });
    return found !== null;
  }

  /**
   * Yo'l ishlatilishi: o'chirilmagan guruhlar soni (javob uchun) va o'chirishni to'sadigan har
   * qanday bog'lanish — guruh (soft delete qilingani ham FK bilan bog'langan), enrollment, progress.
   */
  async pathUsage(pathId: string): Promise<PathUsage> {
    const rows = await this.prisma.client.$queryRaw<{ groups_count: number; in_use: boolean }[]>`
      SELECT
        (SELECT COUNT(*)::int FROM groups g WHERE g.path_id = ${pathId}::uuid
           AND g.deleted_at IS NULL) AS groups_count,
        (EXISTS (SELECT 1 FROM groups g WHERE g.path_id = ${pathId}::uuid)
         OR EXISTS (SELECT 1 FROM student_path_enrollments e WHERE e.path_id = ${pathId}::uuid)
         OR EXISTS (SELECT 1 FROM topic_progress tp JOIN topics t ON t.id = tp.topic_id
           JOIN path_sections s ON s.id = t.section_id WHERE s.path_id = ${pathId}::uuid)
         OR EXISTS (SELECT 1 FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
           JOIN topics t ON t.id = l.topic_id JOIN path_sections s ON s.id = t.section_id
           WHERE s.path_id = ${pathId}::uuid)) AS in_use`;
    const row = rows[0];
    return { groupsCount: row?.groups_count ?? 0, inUse: row?.in_use ?? false };
  }
}
