import type { ChestStatus, LessonStatus, SkillRef, StudentPathMap, TopicStatus } from '@lms/shared';

/**
 * Yo'lning studentga ko'rinadigan tuzilmasi (3.3 §4.2): faqat butun zanjiri `PUBLISHED` kontent,
 * ko'rinadigan darssiz mavzu va mavzusiz bo'lim kirmaydi. JSON sifatida keshlanadi (sanalarsiz).
 */
export interface VisibleLesson {
  id: string;
  title: string;
  estMinutes: number | null;
}

export interface VisibleTopic {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  icon: string | null;
  skills: SkillRef[];
  lessons: VisibleLesson[];
}

export interface VisibleChest {
  id: string;
  title: string;
  afterTopicId: string;
}

export interface VisibleSection {
  id: string;
  title: string;
  topics: VisibleTopic[];
  chests: VisibleChest[];
}

export interface VisiblePath {
  id: string;
  title: string;
  sections: VisibleSection[];
}

/** Bazaga yoziladigan mavzu holati (`LOCKED` hech qachon yozilmaydi). */
export type RecordedTopicStatus = Exclude<TopicStatus, typeof TopicStatus.LOCKED>;

/** Bazaga yoziladigan dars holati (`lesson_progress`). */
export type RecordedLessonStatus = typeof LessonStatus.IN_PROGRESS | typeof LessonStatus.COMPLETED;

export interface LessonProgressRecord {
  status: RecordedLessonStatus;
  startedAt: Date;
  completedAt: Date | null;
}

/** Studentning shu yo'ldagi progress qatorlari. */
export interface ProgressSnapshot {
  topics: ReadonlyMap<string, RecordedTopicStatus>;
  lessons: ReadonlyMap<string, LessonProgressRecord>;
}

/** `PathUnlockCalculator` natijasi (3.3 §4.3). Faqat ko'rinadigan tugunlar uchun. */
export interface PathUnlockState {
  topics: ReadonlyMap<string, TopicStatus>;
  lessons: ReadonlyMap<string, LessonStatus>;
  chests: ReadonlyMap<string, ChestStatus>;
  currentTopicId: string | null;
}

/** Bitta so'rov uchun yig'ilgan holat: tuzilma, zanjir, progress va hisoblangan holatlar. */
export interface StudentPathState {
  studentId: string;
  path: VisiblePath;
  /** Ko'rinadigan zanjir (bo'limlar, keyin mavzular tartibida). */
  chain: readonly VisibleTopic[];
  progress: ProgressSnapshot;
  unlock: PathUnlockState;
  enrollmentCompletedAt: Date | null;
}

/** `path:{studentId}` kesh konverti (3.3 §6). */
export interface StudentPathCacheEnvelope {
  pathId: string;
  contentVersion: string;
  map: StudentPathMap;
}
