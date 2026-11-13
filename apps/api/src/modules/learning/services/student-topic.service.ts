import { Injectable } from '@nestjs/common';

import { LessonStatus } from '@lms/shared';
import type { StudentTopicDetail } from '@lms/shared';

import { LessonAccessGuardService } from './lesson-access-guard.service.js';
import { PathProgressCalculator } from './path-progress-calculator.js';

/** `GET /student/topics/:id` (3.3 §2.2): faqat ochiq mavzu; darslar ko'rinadiganlari, holati bilan. */
@Injectable()
export class StudentTopicService {
  constructor(
    private readonly access: LessonAccessGuardService,
    private readonly progress: PathProgressCalculator,
  ) {}

  async get(studentId: string, topicId: string): Promise<StudentTopicDetail> {
    const { state, topic, topicStatus } = await this.access.topic(studentId, topicId);
    const section = state.path.sections.find((item) => item.id === topic.sectionId);
    return {
      id: topic.id,
      title: topic.title,
      description: topic.description,
      icon: topic.icon,
      status: topicStatus,
      section: { id: topic.sectionId, title: section?.title ?? '' },
      skills: topic.skills,
      lessons: topic.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        estMinutes: lesson.estMinutes,
        status: state.unlock.lessons.get(lesson.id) ?? LessonStatus.LOCKED,
      })),
      lessonsCompleted: this.progress.topicLessons(topic, state.progress).lessonsCompleted,
    };
  }
}
