import { ContentStatus } from '@lms/shared';

import { mockConflict } from '@/lib/api';

import { ContentConflictReason } from '../types/admin-content.types';

import { toAdminLesson, toTopicNode } from './admin-content.mock-mappers';
import {
  applyOrder,
  applyPatch,
  hasProgress,
  hasProgressConflict,
  lessonIdsOfTopics,
  mockDb,
  newMockId,
  nextOrder,
  nowIso,
  removeTopics,
  requireById,
} from './admin-content.mock-store';

import type { MockLesson, MockTopic } from './admin-content.mock-data';
import type {
  CreateLessonRequest,
  CreateTopicRequest,
  UpdateLessonRequest,
  UpdateTopicRequest,
} from '../types/admin-content-api.types';
import type { AdminLesson, AdminTopicNode } from '../types/admin-content.types';

/** Mavzu va dars amallari (soxta API). Ko'chirish yo'q (Q-2). */

function topicsOf(sectionId: string): MockTopic[] {
  return mockDb().topics.filter((topic) => topic.sectionId === sectionId);
}

function lessonsOf(topicId: string): MockLesson[] {
  return mockDb().lessons.filter((lesson) => lesson.topicId === topicId);
}

export function createTopic(sectionId: string, body: CreateTopicRequest): AdminTopicNode {
  requireById(mockDb().sections, sectionId);
  const topic: MockTopic = {
    id: newMockId('topic'),
    sectionId,
    order: nextOrder(topicsOf(sectionId)),
    title: body.title,
    description: body.description ?? null,
    icon: body.icon ?? null,
    status: ContentStatus.DRAFT,
  };
  mockDb().topics.push(topic);
  return toTopicNode(topic);
}

export function updateTopic(topicId: string, body: UpdateTopicRequest): AdminTopicNode {
  const topic = requireById(mockDb().topics, topicId);
  applyPatch(topic, body);
  return toTopicNode(topic);
}

export function deleteTopic(topicId: string): void {
  requireById(mockDb().topics, topicId);
  if (hasProgress(lessonIdsOfTopics([topicId]))) {
    throw hasProgressConflict();
  }
  const chest = mockDb().chests.find((item) => item.afterTopicId === topicId);
  if (chest !== undefined) {
    throw mockConflict("Mavzuga sandiq bog'langan", {
      reason: ContentConflictReason.HAS_CHEST,
      chestId: chest.id,
    });
  }
  removeTopics([topicId]);
}

export function reorderTopics(sectionId: string, topicIds: readonly string[]): void {
  requireById(mockDb().sections, sectionId);
  applyOrder(topicsOf(sectionId), topicIds, 'topicIds');
}

export function createLesson(topicId: string, body: CreateLessonRequest): AdminLesson {
  requireById(mockDb().topics, topicId);
  const now = nowIso();
  const lesson: MockLesson = {
    id: newMockId('lesson'),
    topicId,
    order: nextOrder(lessonsOf(topicId)),
    title: body.title,
    contentMd: body.contentMd ?? '',
    videoUrl: body.videoUrl ?? null,
    estMinutes: body.estMinutes ?? null,
    status: ContentStatus.DRAFT,
    createdAt: now,
    updatedAt: now,
  };
  mockDb().lessons.push(lesson);
  return toAdminLesson(lesson);
}

export function getLesson(lessonId: string): AdminLesson {
  return toAdminLesson(requireById(mockDb().lessons, lessonId));
}

export function updateLesson(lessonId: string, body: UpdateLessonRequest): AdminLesson {
  const lesson = requireById(mockDb().lessons, lessonId);
  applyPatch(lesson, body);
  lesson.updatedAt = nowIso();
  return toAdminLesson(lesson);
}

export function deleteLesson(lessonId: string): void {
  requireById(mockDb().lessons, lessonId);
  if (hasProgress([lessonId])) {
    throw hasProgressConflict();
  }
  const db = mockDb();
  db.lessons = db.lessons.filter((lesson) => lesson.id !== lessonId);
}

export function reorderLessons(topicId: string, lessonIds: readonly string[]): void {
  requireById(mockDb().topics, topicId);
  applyOrder(lessonsOf(topicId), lessonIds, 'lessonIds');
}
