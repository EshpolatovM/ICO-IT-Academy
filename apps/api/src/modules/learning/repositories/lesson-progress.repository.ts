import { Injectable } from '@nestjs/common';

import { LessonStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { LessonProgressRecord } from '../learning.types.js';

/**
 * `lesson_progress` (3.1 §2.10). Yaratish faqat `ON CONFLICT DO NOTHING` (`skipDuplicates`) bilan;
 * yakunlash `WHERE status = 'IN_PROGRESS'` — `status` va `completed_at` bitta statement'da (CHECK).
 */
@Injectable()
export class LessonProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string, lessonId: string): Promise<LessonProgressRecord | null> {
    return this.prisma.client.lessonProgress.findUnique({
      where: { studentId_lessonId: { studentId, lessonId } },
      select: { status: true, startedAt: true, completedAt: true },
    });
  }

  /** Darsni boshlaydi (idempotent: takroriy chaqiruv `started_at`/`COMPLETED` ga tegmaydi). */
  async start(studentId: string, lessonId: string): Promise<void> {
    await this.prisma.client.lessonProgress.createMany({
      data: [{ studentId, lessonId, status: LessonStatus.IN_PROGRESS }],
      skipDuplicates: true,
    });
  }

  /** `IN_PROGRESS → COMPLETED`. Yangilangan bo'lsa — `true` (0 qator — allaqachon yakunlangan). */
  async complete(studentId: string, lessonId: string, at: Date): Promise<boolean> {
    const { count } = await this.prisma.client.lessonProgress.updateMany({
      where: { studentId, lessonId, status: LessonStatus.IN_PROGRESS },
      data: { status: LessonStatus.COMPLETED, completedAt: at },
    });
    return count > 0;
  }

  /** Berilgan darslardan nechtasi yakunlangan. */
  countCompleted(studentId: string, lessonIds: readonly string[]): Promise<number> {
    return this.prisma.client.lessonProgress.count({
      where: { studentId, lessonId: { in: [...lessonIds] }, status: LessonStatus.COMPLETED },
    });
  }
}
