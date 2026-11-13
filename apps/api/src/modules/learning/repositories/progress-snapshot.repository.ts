import { Injectable } from '@nestjs/common';

import { TopicStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { ProgressSnapshot, RecordedTopicStatus } from '../learning.types.js';

/**
 * Studentning bitta yo'ldagi barcha progress qatorlari (`topic_progress` + `lesson_progress`) —
 * ikki indeksli so'rov (`PathUnlockCalculator` kirishi). Ko'rinmaydigan kontent qatorlari ham
 * keladi, kalkulyator faqat ko'rinadiganlarini ishlatadi.
 */
@Injectable()
export class ProgressSnapshotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async load(studentId: string, pathId: string): Promise<ProgressSnapshot> {
    const client = this.prisma.client;
    const [topicRows, lessonRows] = await Promise.all([
      client.topicProgress.findMany({
        where: { studentId, topic: { section: { pathId } } },
        select: { topicId: true, status: true },
      }),
      client.lessonProgress.findMany({
        where: { studentId, lesson: { topic: { section: { pathId } } } },
        select: { lessonId: true, status: true, startedAt: true, completedAt: true },
      }),
    ]);
    const topics = new Map<string, RecordedTopicStatus>();
    for (const { topicId, status } of topicRows) {
      if (status !== TopicStatus.LOCKED) {
        topics.set(topicId, status);
      }
    }
    return {
      topics,
      lessons: new Map(lessonRows.map(({ lessonId, ...record }) => [lessonId, record])),
    };
  }
}
