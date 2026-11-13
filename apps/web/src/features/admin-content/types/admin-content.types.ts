/*
 * Admin kontent API kontrakti (docs/tasks/03-3.2-admin-kontent-api.md §2.2–§2.4).
 * TODO(3.2): @lms/shared ga ko'chiriladi (`packages/shared/src/content/`) — backend tayyor
 * bo'lganda shu fayl o'chiriladi va importlar `@lms/shared` ga almashtiriladi.
 * B-2: admin-groups dagi `LearningPathsResponse` ga tegilmaydi — bu feature'ning o'z tiplari.
 */

import type { ContentStatus } from '@lms/shared';

/** 409 `CONFLICT` `details.reason` (§2.4). */
export const ContentConflictReason = {
  PATH_IN_USE: 'PATH_IN_USE',
  HAS_PROGRESS: 'HAS_PROGRESS',
  HAS_CHEST: 'HAS_CHEST',
  CHEST_EXISTS: 'CHEST_EXISTS',
} as const;
export type ContentConflictReason =
  (typeof ContentConflictReason)[keyof typeof ContentConflictReason];

/** `GET /admin/paths` elementi. */
export interface AdminPathItem {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  description: string | null;
  updatedAt: string;
  sectionsCount: number;
  topicsCount: number;
}

/** `GET /admin/paths` — pagination'siz, `updatedAt desc` (T-5). */
export interface AdminPathsResponse {
  items: AdminPathItem[];
}

export interface AdminPathDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  groupsCount: number;
}

/** Sandiq mukofoti (docs/11:214, D-2): butun son, `min ≤ max`; qat'iy qiymat — `min = max`. */
export interface RewardRange {
  min: number;
  max: number;
}

export interface ChestReward {
  xp: RewardRange;
  coin: RewardRange;
}

export interface ContentSkillRef {
  id: string;
  name: string;
  icon: string | null;
}

export interface AdminLessonNode {
  id: string;
  order: number;
  title: string;
  status: ContentStatus;
  estMinutes: number | null;
  hasVideo: boolean;
}

export interface AdminTopicNode {
  id: string;
  order: number;
  title: string;
  description: string | null;
  icon: string | null;
  status: ContentStatus;
  skills: ContentSkillRef[];
  lessons: AdminLessonNode[];
}

export interface AdminChestNode {
  id: string;
  title: string;
  afterTopicId: string;
  reward: ChestReward;
}

export interface AdminSectionNode {
  id: string;
  order: number;
  title: string;
  description: string | null;
  status: ContentStatus;
  topics: AdminTopicNode[];
  chests: AdminChestNode[];
}

/** `GET /admin/paths/:id/tree` — barcha statuslar, `order` bo'yicha. */
export interface AdminPathTree {
  path: AdminPathDetail;
  sections: AdminSectionNode[];
}

/** `GET /admin/lessons/:id`. */
export interface AdminLesson {
  id: string;
  order: number;
  title: string;
  contentMd: string;
  videoUrl: string | null;
  estMinutes: number | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  topic: { id: string; title: string };
  path: { id: string; title: string };
}
