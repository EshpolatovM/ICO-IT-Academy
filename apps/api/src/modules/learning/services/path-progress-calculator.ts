import { Injectable } from '@nestjs/common';

import { LessonStatus, TopicStatus } from '@lms/shared';

import type { PathUnlockState, ProgressSnapshot, VisibleTopic } from '../learning.types.js';

export interface TopicLessonCounts {
  lessons: number;
  lessonsCompleted: number;
}

/**
 * Progress foizlari (3.3 §4.5, D-5) — sof: faqat ko'rinadigan kontent. Kasr `0…1`, maxraj 0 — `0`.
 * `COMPLETED` mavzu keyin unga dars qo'shilsa ham yakunlangan hisoblanadi (S-B2).
 */
@Injectable()
export class PathProgressCalculator {
  topicLessons(topic: VisibleTopic, progress: ProgressSnapshot): TopicLessonCounts {
    const lessonsCompleted = topic.lessons.filter(
      (lesson) => progress.lessons.get(lesson.id)?.status === LessonStatus.COMPLETED,
    ).length;
    return { lessons: topic.lessons.length, lessonsCompleted };
  }

  /** Mavzular to'plami (bo'lim yoki butun zanjir) bo'yicha: `COMPLETED` / jami. */
  completedRatio(topics: readonly VisibleTopic[], unlock: PathUnlockState): number {
    const completed = topics.filter(
      (topic) => unlock.topics.get(topic.id) === TopicStatus.COMPLETED,
    ).length;
    return topics.length === 0 ? 0 : completed / topics.length;
  }
}
