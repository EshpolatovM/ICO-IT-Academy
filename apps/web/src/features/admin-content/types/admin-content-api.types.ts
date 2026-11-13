/*
 * Admin kontent so'rov shakllari va API qatlami interfeysi (§2.1–§2.2).
 * TODO(3.2): so'rov tiplari @lms/shared ga ko'chiriladi.
 */

import type { ContentStatus } from '@lms/shared';

import type {
  AdminChestNode,
  AdminLesson,
  AdminPathDetail,
  AdminPathsResponse,
  AdminPathTree,
  AdminSectionNode,
  AdminTopicNode,
  ChestReward,
} from './admin-content.types';

export interface CreatePathRequest {
  title: string;
  slug: string;
  description?: string;
}

/** `PUBLISHED` faqat `POST …/publish` orqali (T-1). */
export interface UpdatePathRequest {
  title?: string;
  slug?: string;
  description?: string | null;
  status?: typeof ContentStatus.DRAFT | typeof ContentStatus.ARCHIVED;
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
}

export interface UpdateSectionRequest {
  title?: string;
  description?: string | null;
  status?: ContentStatus;
}

export interface CreateTopicRequest {
  title: string;
  description?: string;
  icon?: string;
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string | null;
  icon?: string | null;
  status?: ContentStatus;
}

export interface CreateLessonRequest {
  title: string;
  contentMd?: string;
  videoUrl?: string;
  estMinutes?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  contentMd?: string;
  videoUrl?: string | null;
  estMinutes?: number | null;
  status?: ContentStatus;
}

export interface CreateChestRequest {
  title: string;
  afterTopicId: string;
  reward: ChestReward;
}

export type UpdateChestRequest = Partial<CreateChestRequest>;

/** API qatlami: hook'lar faqat shunga bog'lanadi (mock yoki HTTP implementatsiya). */
export interface AdminContentApi {
  listPaths: () => Promise<AdminPathsResponse>;
  createPath: (body: CreatePathRequest) => Promise<AdminPathDetail>;
  updatePath: (pathId: string, body: UpdatePathRequest) => Promise<AdminPathDetail>;
  deletePath: (pathId: string) => Promise<void>;
  publishPath: (pathId: string) => Promise<AdminPathDetail>;
  getTree: (pathId: string) => Promise<AdminPathTree>;
  createSection: (pathId: string, body: CreateSectionRequest) => Promise<AdminSectionNode>;
  updateSection: (sectionId: string, body: UpdateSectionRequest) => Promise<AdminSectionNode>;
  deleteSection: (sectionId: string) => Promise<void>;
  reorderSections: (pathId: string, sectionIds: string[]) => Promise<void>;
  createTopic: (sectionId: string, body: CreateTopicRequest) => Promise<AdminTopicNode>;
  updateTopic: (topicId: string, body: UpdateTopicRequest) => Promise<AdminTopicNode>;
  deleteTopic: (topicId: string) => Promise<void>;
  reorderTopics: (sectionId: string, topicIds: string[]) => Promise<void>;
  createLesson: (topicId: string, body: CreateLessonRequest) => Promise<AdminLesson>;
  getLesson: (lessonId: string) => Promise<AdminLesson>;
  updateLesson: (lessonId: string, body: UpdateLessonRequest) => Promise<AdminLesson>;
  deleteLesson: (lessonId: string) => Promise<void>;
  reorderLessons: (topicId: string, lessonIds: string[]) => Promise<void>;
  createChest: (sectionId: string, body: CreateChestRequest) => Promise<AdminChestNode>;
  updateChest: (chestId: string, body: UpdateChestRequest) => Promise<AdminChestNode>;
  deleteChest: (chestId: string) => Promise<void>;
}
