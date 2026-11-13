import { Injectable } from '@nestjs/common';

import { LessonStatus, TopicStatus } from '@lms/shared';

import { contentLocked, learningNotFound } from '../learning.errors.js';

import { StudentPathStateService } from './student-path-state.service.js';

import type { StudentPathState, VisibleLesson, VisibleTopic } from '../learning.types.js';

/** Ochiq mavzu va uning holati (`GET /student/topics/:id`). */
export interface TopicAccess {
  state: StudentPathState;
  topic: VisibleTopic;
  topicStatus: TopicStatus;
}

/** Ochiq dars va uning holati (`GET /student/lessons/:id`, `start`, `complete`). */
export interface LessonAccess extends TopicAccess {
  lesson: VisibleLesson;
  lessonIndex: number;
  lessonStatus: LessonStatus;
}

/**
 * Bitta joyda (3.3 §4.4): resurs ko'rinadimi (yo'q, boshqa yo'lda, nashr qilinmagan — 404) va
 * ochiqmi (`LOCKED` — 403). Student faqat o'z joriy yo'lini ko'radi (id faqat tokendan).
 */
@Injectable()
export class LessonAccessGuardService {
  constructor(private readonly states: StudentPathStateService) {}

  async topic(studentId: string, topicId: string): Promise<TopicAccess> {
    const state = await this.requireState(studentId);
    const topic = state.chain.find((item) => item.id === topicId);
    const topicStatus = state.unlock.topics.get(topicId);
    if (topic === undefined || topicStatus === undefined) {
      throw learningNotFound();
    }
    if (topicStatus === TopicStatus.LOCKED) {
      throw contentLocked();
    }
    return { state, topic, topicStatus };
  }

  async lesson(studentId: string, lessonId: string): Promise<LessonAccess> {
    const state = await this.requireState(studentId);
    const topic = state.chain.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
    const lessonIndex = topic?.lessons.findIndex((lesson) => lesson.id === lessonId) ?? -1;
    const lesson = topic?.lessons[lessonIndex];
    const topicStatus = topic ? state.unlock.topics.get(topic.id) : undefined;
    const lessonStatus = state.unlock.lessons.get(lessonId);
    if (!topic || !lesson || topicStatus === undefined || lessonStatus === undefined) {
      throw learningNotFound();
    }
    if (lessonStatus === LessonStatus.LOCKED) {
      throw contentLocked();
    }
    return { state, topic, topicStatus, lesson, lessonIndex, lessonStatus };
  }

  private async requireState(studentId: string): Promise<StudentPathState> {
    const state = await this.states.load(studentId);
    if (state === null) {
      throw learningNotFound();
    }
    return state;
  }
}
