import { Injectable } from '@nestjs/common';

import type { LessonStartResponse } from '@lms/shared';

import { reviewRequired } from '../learning.errors.js';

import { LearningTransaction } from './learning-transaction.service.js';
import { LessonAccessGuardService } from './lesson-access-guard.service.js';
import { LessonProgressWriter } from './lesson-progress-writer.service.js';
import { ReviewGate } from './review-gate.js';

import type { LessonAccess } from './lesson-access-guard.service.js';

/**
 * `POST /student/lessons/:id/start` (3.3 §4.6): boshlangan/yakunlangan dars — idempotent 200
 * (yozuvsiz); yangi dars — `ReviewGate` (409 `REVIEW_REQUIRED`), so'ng bitta tranzaksiyada dars va
 * mavzu `IN_PROGRESS` (`COMPLETED` ga tegilmaydi); commit'dan keyin kesh invalidatsiyasi.
 */
@Injectable()
export class LessonStartService {
  constructor(
    private readonly access: LessonAccessGuardService,
    private readonly gate: ReviewGate,
    private readonly transaction: LearningTransaction,
    private readonly writer: LessonProgressWriter,
  ) {}

  async start(studentId: string, lessonId: string): Promise<LessonStartResponse> {
    const access = await this.access.lesson(studentId, lessonId);
    const record = access.state.progress.lessons.get(lessonId);
    if (record !== undefined) {
      return {
        lessonId,
        lessonStatus: record.status,
        topicStatus: access.topicStatus,
        startedAt: record.startedAt.toISOString(),
      };
    }
    await this.assertGateOpen(studentId);
    return this.transaction.commit(studentId, async () => ({
      result: await this.write(access),
      events: [],
    }));
  }

  /** Yangi (boshlanmagan) darsdan oldin — `complete` ham shuni ishlatadi (T-5). */
  async assertGateOpen(studentId: string): Promise<void> {
    const result = await this.gate.check(studentId);
    if (!result.allowed) {
      throw reviewRequired({ due: result.due });
    }
  }

  private async write({ state, topic, lesson }: LessonAccess): Promise<LessonStartResponse> {
    const { studentId } = state;
    await this.writer.start(studentId, lesson.id, topic.id);
    const record = await this.writer.lesson(studentId, lesson.id);
    if (record === null) {
      throw new Error(`lesson_progress yozilmadi: ${lesson.id}`);
    }
    return {
      lessonId: lesson.id,
      lessonStatus: record.status,
      topicStatus: await this.writer.topicStatus(studentId, topic.id),
      startedAt: record.startedAt.toISOString(),
    };
  }
}
