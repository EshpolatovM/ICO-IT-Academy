import type { ChestReward } from './content.schemas.js';
import type { ContentStatus } from '../enums/content-status.js';
import type { LearningPathListItem } from '../groups/group.types.js';
import type { PaginatedResult } from '../pagination/offset-pagination.js';

/**
 * Ilm yo'li kontenti javoblari (docs/12 §3, 3.2 §2.3). Vaqtlar — ISO-8601.
 * B-2: `LearningPathListItem`/`LearningPathsResponse` (groups) o'zgarishsiz; admin elementi ularni
 * kengaytiradi — guruh formasi (`PathSelect`) buzilmaydi.
 */

/** `GET /admin/paths` elementi (2.3 shakli + kontent maydonlari). */
export interface AdminPathItem extends LearningPathListItem {
  description: string | null;
  updatedAt: string;
  sectionsCount: number;
  topicsCount: number;
}

/** `GET /admin/paths` — 200 (`LearningPathsResponse` ga strukturaviy mos). Tartib: `title, id`. */
export interface AdminPathsResponse {
  items: AdminPathItem[];
}

/** `GET/PATCH/POST /admin/paths[/:id[/publish]]`. `groupsCount` — o'chirilmagan guruhlar. */
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

/** Ko'nikmaga qisqa havola. */
export interface SkillRef {
  id: string;
  name: string;
  icon: string | null;
}

/** Daraxtdagi dars (`contentMd` kirmaydi — hajm). */
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
  skills: SkillRef[];
  lessons: AdminLessonNode[];
}

/** Sandiq (`status` yo'q — ko'rinishi `afterTopic` ga bog'liq). */
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

/** `GET /admin/paths/:id/tree` — barcha holatlar, `order` bo'yicha. */
export interface AdminPathTree {
  path: AdminPathDetail;
  sections: AdminSectionNode[];
}

/** `GET/POST/PATCH /admin/lessons/:id`, `POST /admin/topics/:id/lessons`. */
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

/** `GET/POST/PATCH /admin/skills[/:id]` elementi. `topicsCount` — biriktirilgan mavzular. */
export interface SkillItem extends SkillRef {
  topicsCount: number;
}

/** `PUT /admin/topics/:id/skills` — 200 (`name` bo'yicha). */
export interface TopicSkillsResponse {
  skills: SkillRef[];
}

/** `GET /admin/skills` — offset pagination (docs/12 §0). */
export type SkillsResponse = PaginatedResult<SkillItem>;
