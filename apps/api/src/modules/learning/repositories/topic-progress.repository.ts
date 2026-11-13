import { Injectable } from '@nestjs/common';

import { TopicStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { RecordedTopicStatus } from '../learning.types.js';

/**
 * `topic_progress` (3.1 §2.9, 3.3 §3.4). Barcha yaratishlar `ON CONFLICT` bilan ("avval topib,
 * keyin yaratish" taqiqlanadi — poygada `23505`); `LOCKED` hech qachon yozilmaydi; `status` va
 * `completed_at` bitta statement'da (CHECK `chk_topic_progress_completed_at`).
 */
@Injectable()
export class TopicProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStatus(studentId: string, topicId: string): Promise<RecordedTopicStatus | null> {
    const row = await this.prisma.client.topicProgress.findUnique({
      where: { studentId_topicId: { studentId, topicId } },
      select: { status: true },
    });
    return row === null || row.status === TopicStatus.LOCKED ? null : row.status;
  }

  /** Ochilgan mavzu (`AVAILABLE`) — qator bo'lsa tegilmaydi. */
  async upsertAvailable(studentId: string, topicId: string): Promise<void> {
    await this.prisma.client.topicProgress.createMany({
      data: [{ studentId, topicId, status: TopicStatus.AVAILABLE }],
      skipDuplicates: true,
    });
  }

  /**
   * Mavzuni boshlaydi — bitta statement (Domla 🟡-6): qator yo'q → `IN_PROGRESS`; `AVAILABLE` →
   * `IN_PROGRESS`; `IN_PROGRESS`/`COMPLETED` ga tegilmaydi. `ON CONFLICT DO UPDATE` mavjud qatorni
   * tranzaksiya oxirigacha qulflaydi (bir mavzudagi parallel `complete` lar ketma-ket bo'ladi).
   */
  async startTopic(studentId: string, topicId: string): Promise<void> {
    await this.prisma.client.$executeRaw`
      INSERT INTO topic_progress (student_id, topic_id, status, started_at, updated_at)
      VALUES (${studentId}::uuid, ${topicId}::uuid, 'IN_PROGRESS', now(), now())
      ON CONFLICT (student_id, topic_id) DO UPDATE
        SET status = 'IN_PROGRESS',
            started_at = COALESCE(topic_progress.started_at, now()),
            updated_at = now()
        WHERE topic_progress.status = 'AVAILABLE'`;
  }

  /** Qatorni tranzaksiya oxirigacha qulflaydi (`SELECT … FOR UPDATE`). */
  async lockForUpdate(studentId: string, topicId: string): Promise<void> {
    await this.prisma.client.$queryRaw`SELECT 1 FROM topic_progress
      WHERE student_id = ${studentId}::uuid AND topic_id = ${topicId}::uuid FOR UPDATE`;
  }

  async incrementLessonsCompleted(studentId: string, topicId: string): Promise<void> {
    await this.prisma.client.topicProgress.update({
      where: { studentId_topicId: { studentId, topicId } },
      data: { lessonsCompleted: { increment: 1 } },
    });
  }

  /** `COMPLETED` ga o'tkazadi — faqat bir marta. O'tish bo'lsa — `true`. */
  async markCompleted(studentId: string, topicId: string, at: Date): Promise<boolean> {
    const { count } = await this.prisma.client.topicProgress.updateMany({
      where: { studentId, topicId, status: { not: TopicStatus.COMPLETED } },
      data: { status: TopicStatus.COMPLETED, completedAt: at },
    });
    return count > 0;
  }

  /** Berilgan mavzulardan nechtasi yakunlangan. */
  countCompleted(studentId: string, topicIds: readonly string[]): Promise<number> {
    return this.prisma.client.topicProgress.count({
      where: { studentId, topicId: { in: [...topicIds] }, status: TopicStatus.COMPLETED },
    });
  }
}
