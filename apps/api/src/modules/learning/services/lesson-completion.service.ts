import { Injectable } from '@nestjs/common';

import { LessonStatus, TopicStatus } from '@lms/shared';
import type { LessonCompleteResponse, NextLessonRef } from '@lms/shared';

import { LearningEventName } from '../events/learning.events.js';

import { LearningTransaction } from './learning-transaction.service.js';
import { LessonAccessGuardService } from './lesson-access-guard.service.js';
import { LessonProgressWriter } from './lesson-progress-writer.service.js';
import { LessonStartService } from './lesson-start.service.js';
import { TopicCompletionService } from './topic-completion.service.js';

import type { LearningChange } from './learning-transaction.service.js';
import type { LessonAccess } from './lesson-access-guard.service.js';
import type { LearningEvent } from '../events/learning.events.js';

/**
 * `POST /student/lessons/:id/complete` (3.3 §4.7). Boshlanmagan dars — avval start qoidalari
 * (`ReviewGate`, T-5) shu tranzaksiyada. Mavzu qatori qulflanadi (bir mavzudagi parallel `complete`
 * lar ketma-ket — mavzu yakunlanishi o'tkazib yuborilmaydi). Takroriy `complete` — idempotent 200,
 * hodisasiz (T-6). Hodisalar va kesh invalidatsiyasi — commit'dan keyin. 3-modulda `rewards: []`.
 */
@Injectable()
export class LessonCompletionService {
  constructor(
    private readonly access: LessonAccessGuardService,
    private readonly starter: LessonStartService,
    private readonly transaction: LearningTransaction,
    private readonly writer: LessonProgressWriter,
    private readonly topicCompletion: TopicCompletionService,
  ) {}

  async complete(studentId: string, lessonId: string): Promise<LessonCompleteResponse> {
    const access = await this.access.lesson(studentId, lessonId);
    if (access.lessonStatus === LessonStatus.COMPLETED) {
      return this.respond(access, access.topicStatus);
    }
    if (access.lessonStatus === LessonStatus.AVAILABLE) {
      await this.starter.assertGateOpen(studentId);
    }
    const topicStatus = await this.transaction.commit(studentId, () =>
      this.write(access, new Date()),
    );
    return this.respond(access, topicStatus);
  }

  private async write(access: LessonAccess, at: Date): Promise<LearningChange<TopicStatus>> {
    const { state, topic, lesson } = access;
    const { studentId, path, chain } = state;
    await this.writer.start(studentId, lesson.id, topic.id);
    const events: LearningEvent[] = [];
    if (await this.writer.complete(studentId, lesson.id, topic.id, at)) {
      events.push({
        name: LearningEventName.LESSON_COMPLETED,
        payload: {
          studentId,
          lessonId: lesson.id,
          topicId: topic.id,
          pathId: path.id,
          completedAt: at,
        },
      });
      events.push(
        ...(await this.topicCompletion.evaluate({ studentId, pathId: path.id, chain, topic }, at)),
      );
    }
    return { result: await this.writer.topicStatus(studentId, topic.id), events };
  }

  private respond(access: LessonAccess, topicStatus: TopicStatus): LessonCompleteResponse {
    return {
      lessonStatus: LessonStatus.COMPLETED,
      topicStatus,
      rewards: [],
      next: this.nextLesson(access, topicStatus),
    };
  }

  /**
   * Keyingi ochiq dars: shu mavzuda keyingisi; mavzu yakunlanmagan bo'lsa — undagi yakunlanmagan
   * boshqa dars; yakunlangan bo'lsa — zanjirdagi keyingi mavzuning birinchi darsi; yo'q — `null`.
   */
  private nextLesson(access: LessonAccess, topicStatus: TopicStatus): NextLessonRef | null {
    const { state, topic, lesson, lessonIndex } = access;
    const following = topic.lessons[lessonIndex + 1];
    if (following) {
      return { topicId: topic.id, lessonId: following.id };
    }
    if (topicStatus !== TopicStatus.COMPLETED) {
      const pending = topic.lessons.find(
        (item) =>
          item.id !== lesson.id &&
          state.progress.lessons.get(item.id)?.status !== LessonStatus.COMPLETED,
      );
      return pending ? { topicId: topic.id, lessonId: pending.id } : null;
    }
    const nextTopic = state.chain[state.chain.findIndex((item) => item.id === topic.id) + 1];
    const first = nextTopic?.lessons[0];
    return nextTopic && first ? { topicId: nextTopic.id, lessonId: first.id } : null;
  }
}
