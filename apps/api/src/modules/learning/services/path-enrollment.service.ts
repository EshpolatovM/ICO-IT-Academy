import { Injectable } from '@nestjs/common';

import { EnrollmentsRepository } from '../repositories/enrollments.repository.js';
import { TopicProgressRepository } from '../repositories/topic-progress.repository.js';

import { LearningTransaction } from './learning-transaction.service.js';

import type { EnrollmentRecord } from '../repositories/enrollments.repository.js';

/**
 * Lazy enrollment (3.3 §4.1, 3.1 §2.8.1): birinchi murojaatda bitta tranzaksiyada ikki idempotent
 * yozuv — enrollment va zanjirning birinchi ko'rinadigan mavzusi uchun `AVAILABLE` qatori (ikkalasi
 * `ON CONFLICT DO NOTHING`). Tez yo'l: enrollment bor — yozuvsiz (bitta `SELECT`).
 */
@Injectable()
export class PathEnrollmentService {
  constructor(
    private readonly transaction: LearningTransaction,
    private readonly enrollments: EnrollmentsRepository,
    private readonly topicProgress: TopicProgressRepository,
  ) {}

  async ensure(
    studentId: string,
    pathId: string,
    firstTopicId: string | null,
  ): Promise<EnrollmentRecord> {
    const existing = await this.enrollments.find(studentId, pathId);
    if (existing !== null) {
      return existing;
    }
    await this.transaction.commit(studentId, async () => {
      await this.enrollments.ensure(studentId, pathId);
      if (firstTopicId !== null) {
        await this.topicProgress.upsertAvailable(studentId, firstTopicId);
      }
      return { result: undefined, events: [] };
    });
    return (await this.enrollments.find(studentId, pathId)) ?? { completedAt: null };
  }
}
