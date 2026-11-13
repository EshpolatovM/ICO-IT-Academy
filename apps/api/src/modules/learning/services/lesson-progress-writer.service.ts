import { Injectable } from '@nestjs/common';

import { TopicStatus } from '@lms/shared';

import { LessonProgressRepository } from '../repositories/lesson-progress.repository.js';
import { TopicProgressRepository } from '../repositories/topic-progress.repository.js';

import type { LessonProgressRecord } from '../learning.types.js';

/**
 * Dars/mavzu progressi yozuvlari — chaqiruvchining tranzaksiyasida (`LearningTransaction`). Barcha
 * yaratishlar `ON CONFLICT` bilan (3.3 §3.4: "avval topib, keyin yaratish" yo'q).
 */
@Injectable()
export class LessonProgressWriter {
  constructor(
    private readonly lessonProgress: LessonProgressRepository,
    private readonly topicProgress: TopicProgressRepository,
  ) {}

  /** Dars `IN_PROGRESS` (qator bo'lsa tegilmaydi), mavzu `IN_PROGRESS` (`COMPLETED` ga tegilmaydi). */
  async start(studentId: string, lessonId: string, topicId: string): Promise<void> {
    await this.lessonProgress.start(studentId, lessonId);
    await this.topicProgress.startTopic(studentId, topicId);
  }

  /**
   * Mavzu qatori qulflanadi (`FOR UPDATE`), so'ng dars `IN_PROGRESS → COMPLETED` va
   * `lessons_completed += 1`. O'tish bo'lmasa (allaqachon yakunlangan) — `false`.
   */
  async complete(studentId: string, lessonId: string, topicId: string, at: Date): Promise<boolean> {
    await this.topicProgress.lockForUpdate(studentId, topicId);
    if (!(await this.lessonProgress.complete(studentId, lessonId, at))) {
      return false;
    }
    await this.topicProgress.incrementLessonsCompleted(studentId, topicId);
    return true;
  }

  lesson(studentId: string, lessonId: string): Promise<LessonProgressRecord | null> {
    return this.lessonProgress.find(studentId, lessonId);
  }

  /** Mavzuning yozilgan holati; qator yo'q bo'lsa (bo'lmasligi kerak) — `IN_PROGRESS`. */
  async topicStatus(studentId: string, topicId: string): Promise<TopicStatus> {
    return (await this.topicProgress.findStatus(studentId, topicId)) ?? TopicStatus.IN_PROGRESS;
  }
}
