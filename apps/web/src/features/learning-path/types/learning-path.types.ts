/*
 * Student ilm yo'li API kontrakti (docs/tasks/03-3.3-student-api.md §2.2–§2.3).
 * TODO(3.3): @lms/shared ga ko'chiriladi (`packages/shared/src/learning/`) — backend tayyor
 * bo'lganda shu fayl o'chiriladi va importlar `@lms/shared` ga almashtiriladi.
 */

/** Mavzu holati (docs/05 §2.1). */
export const TopicStatus = {
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;
export type TopicStatus = (typeof TopicStatus)[keyof typeof TopicStatus];

/** Dars holati (API): mavzu holatlari bilan bir xil qiymatlar. */
export const LessonStatus = TopicStatus;
export type LessonStatus = TopicStatus;

/** Sandiq holati: `OPENED` — 5-modulda. */
export const ChestStatus = {
  LOCKED: 'LOCKED',
  READY: 'READY',
  OPENED: 'OPENED',
} as const;
export type ChestStatus = (typeof ChestStatus)[keyof typeof ChestStatus];

export const PathNodeKind = {
  TOPIC: 'TOPIC',
  CHEST: 'CHEST',
} as const;
export type PathNodeKind = (typeof PathNodeKind)[keyof typeof PathNodeKind];

export interface StudentPathSummary {
  id: string;
  title: string;
  /** 0…1 kasr (yaxlitlanmagan). */
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

/** `GET /student/path`. Faol yo'l bo'lmasa: `path: null`, `sections: []`. */
export interface StudentPathMap {
  path: StudentPathSummary | null;
  reviewBlock: ReviewBlock;
  sections: StudentPathSection[];
}

/** Mavzuga biriktirilgan ko'nikma. Kontraktda maydonlari aniqlanmagan (savol Boltavoyga). */
export interface SkillRef {
  id: string;
  name: string;
}

export interface StudentTopicLesson {
  id: string;
  title: string;
  estMinutes: number;
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
  estMinutes: number;
  status: LessonStatus;
  topic: { id: string; title: string };
  prevLessonId: string | null;
  nextLessonId: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

/** `POST /student/lessons/:id/start`. */
export interface LessonStartResponse {
  lessonId: string;
  lessonStatus: typeof LessonStatus.IN_PROGRESS | typeof LessonStatus.COMPLETED;
  topicStatus: TopicStatus;
  startedAt: string;
}

/** 5-modul uchun; 3-modulda `rewards` doim bo'sh. */
export interface RewardItem {
  type: 'XP' | 'COIN';
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

/** API qatlami interfeysi: hook'lar faqat shunga bog'lanadi (mock yoki HTTP implementatsiya). */
export interface LearningPathApi {
  getPathMap: () => Promise<StudentPathMap>;
  getTopic: (topicId: string) => Promise<StudentTopicDetail>;
  getLesson: (lessonId: string) => Promise<StudentLesson>;
  startLesson: (lessonId: string) => Promise<LessonStartResponse>;
  completeLesson: (lessonId: string) => Promise<LessonCompleteResponse>;
}
