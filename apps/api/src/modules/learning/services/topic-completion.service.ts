import { Injectable } from '@nestjs/common';

import { LessonStatus, TopicStatus } from '@lms/shared';

import { LearningEventName } from '../events/learning.events.js';
import { EnrollmentsRepository } from '../repositories/enrollments.repository.js';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository.js';
import { TopicProgressRepository } from '../repositories/topic-progress.repository.js';

import { LearningTransaction } from './learning-transaction.service.js';

import type { LearningEvent } from '../events/learning.events.js';
import type { ProgressSnapshot, StudentPathState, VisibleTopic } from '../learning.types.js';

/** Mavzu yakunlanishini tekshirish uchun kontekst: yo'l, zanjir va mavzu. */
export interface TopicCompletionTarget {
  studentId: string;
  pathId: string;
  chain: readonly VisibleTopic[];
  topic: VisibleTopic;
}

/**
 * Mavzu va yo'l yakunlanishi (3.3 §4.8, TL Q-6): mavzu `COMPLETED` ⇔ barcha ko'rinadigan darslari
 * `COMPLETED` (soni > 0). O'tish faqat bir marta (`markCompleted` — `status <> 'COMPLETED'`); faqat
 * o'tishda keyingi ko'rinadigan mavzuga `AVAILABLE` qatori, `topic.completed` hodisasi va (barcha
 * mavzular yakunlangan bo'lsa) enrollment `completed_at`. `evaluate` chaqiruvchining tranzaksiyasida
 * va mavzu qatori qulflangan holda ishlaydi.
 */
@Injectable()
export class TopicCompletionService {
  constructor(
    private readonly transaction: LearningTransaction,
    private readonly topicProgress: TopicProgressRepository,
    private readonly lessonProgress: LessonProgressRepository,
    private readonly enrollments: EnrollmentsRepository,
  ) {}

  /** 3-modul sharti (4-modulda `pass_threshold` bilan kengaytiriladi). */
  isTopicSatisfied(lessonsTotal: number, lessonsCompleted: number): boolean {
    return lessonsTotal > 0 && lessonsCompleted === lessonsTotal;
  }

  /** Mavzu yakunlandimi — o'tish bo'lsa hodisa(lar) qaytadi (commit'dan keyin chiqariladi). */
  async evaluate(target: TopicCompletionTarget, at: Date): Promise<LearningEvent[]> {
    const { studentId, topic, chain, pathId } = target;
    const lessonIds = topic.lessons.map((lesson) => lesson.id);
    const completed = await this.lessonProgress.countCompleted(studentId, lessonIds);
    if (!this.isTopicSatisfied(lessonIds.length, completed)) {
      return [];
    }
    if (!(await this.topicProgress.markCompleted(studentId, topic.id, at))) {
      return [];
    }
    const next = chain[chain.findIndex((item) => item.id === topic.id) + 1];
    if (next !== undefined) {
      await this.topicProgress.upsertAvailable(studentId, next.id);
    }
    await this.completePathIfDone(studentId, pathId, chain);
    return [
      {
        name: LearningEventName.TOPIC_COMPLETED,
        payload: { studentId, topicId: topic.id, pathId, completedAt: at },
      },
    ];
  }

  /**
   * Reconcile kerakmi (kontent o'zgarishi, 3.3 §4.8): yozilgan holati `COMPLETED` emas, lekin sharti
   * bajarilgan mavzu bor yoki barcha mavzular yakunlangan, lekin enrollment yakunlanmagan.
   */
  needsReconcile(state: StudentPathState): boolean {
    return this.staleTopics(state).length > 0 || this.pathCompletionPending(state);
  }

  /** `GET /student/path` dagi yagona yozuv (lazy enrollment bilan birga) — `UnitOfWork` ichida. */
  async reconcile(state: StudentPathState): Promise<void> {
    const { studentId, path, chain } = state;
    const at = new Date();
    await this.transaction.commit(studentId, async () => {
      const events: LearningEvent[] = [];
      for (const topic of this.staleTopics(state)) {
        await this.topicProgress.startTopic(studentId, topic.id);
        await this.topicProgress.lockForUpdate(studentId, topic.id);
        events.push(...(await this.evaluate({ studentId, pathId: path.id, chain, topic }, at)));
      }
      await this.completePathIfDone(studentId, path.id, chain);
      return { result: undefined, events };
    });
  }

  private staleTopics(state: StudentPathState): VisibleTopic[] {
    return state.chain.filter(
      (topic) =>
        state.progress.topics.get(topic.id) !== TopicStatus.COMPLETED &&
        this.isTopicSatisfied(topic.lessons.length, completedLessons(topic, state.progress)),
    );
  }

  private pathCompletionPending(state: StudentPathState): boolean {
    return (
      state.enrollmentCompletedAt === null &&
      state.chain.length > 0 &&
      state.chain.every((topic) => state.progress.topics.get(topic.id) === TopicStatus.COMPLETED)
    );
  }

  private async completePathIfDone(
    studentId: string,
    pathId: string,
    chain: readonly VisibleTopic[],
  ): Promise<void> {
    const topicIds = chain.map((topic) => topic.id);
    const completed = await this.topicProgress.countCompleted(studentId, topicIds);
    if (topicIds.length > 0 && completed === topicIds.length) {
      await this.enrollments.markCompleted(studentId, pathId);
    }
  }
}

function completedLessons(topic: VisibleTopic, progress: ProgressSnapshot): number {
  return topic.lessons.filter(
    (lesson) => progress.lessons.get(lesson.id)?.status === LessonStatus.COMPLETED,
  ).length;
}
