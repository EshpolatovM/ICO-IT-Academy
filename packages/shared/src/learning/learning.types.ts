import type { ChestStatus } from './enums/chest-status.js';
import type { LessonStatus } from './enums/lesson-status.js';
import type { TopicStatus } from './enums/topic-status.js';
import type { SkillRef } from '../content/content.types.js';

/** Student ilm yo'li API kontrakti (docs/12 §4, 3.3 §2.2). */

/** Xarita tuguni turi. */
export const PathNodeKind = {
  TOPIC: 'TOPIC',
  CHEST: 'CHEST',
} as const;
export type PathNodeKind = (typeof PathNodeKind)[keyof typeof PathNodeKind];

/** Mukofot turi (5-modul; 3-modulda `rewards` doim bo'sh). */
export const RewardType = {
  XP: 'XP',
  COIN: 'COIN',
} as const;
export type RewardType = (typeof RewardType)[keyof typeof RewardType];

export interface StudentPathSummary {
  id: string;
  title: string;
  /** `0…1` kasr (yaxlitlanmagan). */
  progress: number;
}

/** "Takrorlash kerak" belgisi (6-modul; 3-modulda doim `blocked: false`). */
export interface ReviewBlock {
  blocked: boolean;
  dueCount: number;
}

export interface StudentTopicNode {
  kind: typeof PathNodeKind.TOPIC;
  id: string;
  title: string;
  icon: string | null;
  status: TopicStatus;
  /** Ko'rinadigan (nashr qilingan) darslar soni. */
  lessons: number;
  lessonsCompleted: number;
}

export interface StudentChestNode {
  kind: typeof PathNodeKind.CHEST;
  id: string;
  title: string;
  status: ChestStatus;
}

export type StudentPathNode = StudentTopicNode | StudentChestNode;

export interface StudentPathSection {
  id: string;
  title: string;
  progress: number;
  nodes: StudentPathNode[];
}

/** `GET /student/path`. Faol yo'l bo'lmasa: `path: null`, `currentTopicId: null`, `sections: []`. */
export interface StudentPathMap {
  path: StudentPathSummary | null;
  /** Joriy pozitsiya (server hisoblaydi, 3.3 R Q-4): ochiq mavzulardan zanjirda eng oxirgisi. */
  currentTopicId: string | null;
  reviewBlock: ReviewBlock;
  sections: StudentPathSection[];
}

export interface StudentTopicLesson {
  id: string;
  title: string;
  estMinutes: number | null;
  status: LessonStatus;
}

/** `GET /student/topics/:id`. */
export interface StudentTopicDetail {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  status: TopicStatus;
  section: { id: string; title: string };
  skills: SkillRef[];
  lessons: StudentTopicLesson[];
  lessonsCompleted: number;
}

/** `GET /student/lessons/:id` (yon ta'sirsiz — darsni boshlamaydi). */
export interface StudentLesson {
  id: string;
  title: string;
  contentMd: string;
  videoUrl: string | null;
  estMinutes: number | null;
  status: LessonStatus;
  topic: { id: string; title: string };
  prevLessonId: string | null;
  nextLessonId: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

/** Boshlangan darsning holati. */
export type StartedLessonStatus = typeof LessonStatus.IN_PROGRESS | typeof LessonStatus.COMPLETED;

/** `POST /student/lessons/:id/start`. */
export interface LessonStartResponse {
  lessonId: string;
  lessonStatus: StartedLessonStatus;
  topicStatus: TopicStatus;
  startedAt: string;
}

export interface RewardItem {
  type: RewardType;
  amount: number;
}

export interface NextLessonRef {
  topicId: string;
  lessonId: string;
}

/** `POST /student/lessons/:id/complete`. */
export interface LessonCompleteResponse {
  lessonStatus: typeof LessonStatus.COMPLETED;
  topicStatus: TopicStatus;
  rewards: RewardItem[];
  next: NextLessonRef | null;
}
