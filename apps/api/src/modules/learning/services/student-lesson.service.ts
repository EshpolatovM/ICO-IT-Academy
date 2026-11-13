import { Injectable } from '@nestjs/common';

import type { StudentLesson } from '@lms/shared';

import { learningNotFound } from '../learning.errors.js';
import { LessonContentRepository } from '../repositories/lesson-content.repository.js';

import { LessonAccessGuardService } from './lesson-access-guard.service.js';

import type { LessonProgressRecord } from '../learning.types.js';

function progressTimes(
  record: LessonProgressRecord | undefined,
): Pick<StudentLesson, 'startedAt' | 'completedAt'> {
  return {
    startedAt: record ? record.startedAt.toISOString() : null,
    completedAt: record?.completedAt ? record.completedAt.toISOString() : null,
  };
}

/**
 * `GET /student/lessons/:id` (3.3 §2.2): yon ta'sirsiz — darsni boshlamaydi va `ReviewGate` ni
 * tekshirmaydi (R Q-9, ataylab). `prev/next` — shu mavzudagi ko'rinadigan qo'shni darslar.
 */
@Injectable()
export class StudentLessonService {
  constructor(
    private readonly access: LessonAccessGuardService,
    private readonly content: LessonContentRepository,
  ) {}

  async get(studentId: string, lessonId: string): Promise<StudentLesson> {
    const { state, topic, lesson, lessonIndex, lessonStatus } = await this.access.lesson(
      studentId,
      lessonId,
    );
    const content = await this.content.findVisible(lessonId);
    if (content === null) {
      throw learningNotFound();
    }
    const record = state.progress.lessons.get(lessonId);
    const neighbours = topic.lessons;
    return {
      id: lesson.id,
      title: lesson.title,
      contentMd: content.contentMd,
      videoUrl: content.videoUrl,
      estMinutes: lesson.estMinutes,
      status: lessonStatus,
      topic: { id: topic.id, title: topic.title },
      prevLessonId: neighbours[lessonIndex - 1]?.id ?? null,
      nextLessonId: neighbours[lessonIndex + 1]?.id ?? null,
      ...progressTimes(record),
    };
  }
}
