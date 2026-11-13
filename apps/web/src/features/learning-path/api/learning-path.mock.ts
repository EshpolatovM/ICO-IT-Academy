import { ErrorCode } from '@lms/shared';

import { ApiError, HttpStatus } from '@/lib/api';

import { LessonStatus, TopicStatus } from '../types/learning-path.types';

import { initialMockProgress, MOCK_PATH } from './learning-path.mock-data';
import {
  buildChain,
  buildPathMap,
  countCompletedLessons,
  lessonStatuses,
} from './learning-path.mock-progress';

import type { MockLessonProgress } from './learning-path.mock-data';
import type { ChainTopic } from './learning-path.mock-progress';
import type {
  LearningPathApi,
  LessonCompleteResponse,
  LessonStartResponse,
  NextLessonRef,
  StudentLesson,
  StudentTopicDetail,
} from '../types/learning-path.types';

/*
 * Soxta API (3.3 backend tayyor bo'lguncha): xotiradagi progress bilan ishlaydi, xatolar
 * haqiqiy kontraktdagidek `ApiError` (404 `NOT_FOUND`, 403 `LOCKED`).
 */

const NOT_FOUND_STATUS = 404;

let progress = initialMockProgress();

/** Testlar uchun: progressni boshlang'ich holatga qaytaradi. */
export function resetLearningPathMock(): void {
  progress = initialMockProgress();
}

interface LessonLocation {
  entry: ChainTopic;
  index: number;
  status: LessonStatus;
}

function notFound(): ApiError {
  return new ApiError({
    status: NOT_FOUND_STATUS,
    code: ErrorCode.NOT_FOUND,
    message: 'Topilmadi',
  });
}

function locked(): ApiError {
  return new ApiError({
    status: HttpStatus.FORBIDDEN,
    code: ErrorCode.LOCKED,
    message: 'Bu hali qulflangan',
  });
}

function chain(): ChainTopic[] {
  return buildChain(MOCK_PATH, progress);
}

function findTopic(topicId: string): ChainTopic {
  const entry = chain().find((item) => item.topic.id === topicId);
  if (entry === undefined) {
    throw notFound();
  }
  if (entry.status === TopicStatus.LOCKED) {
    throw locked();
  }
  return entry;
}

function findLesson(lessonId: string): LessonLocation {
  for (const entry of chain()) {
    const index = entry.topic.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index >= 0) {
      const status = lessonStatuses(entry, progress)[index] ?? LessonStatus.LOCKED;
      if (status === LessonStatus.LOCKED) {
        throw locked();
      }
      return { entry, index, status };
    }
  }
  throw notFound();
}

function topicDetail(entry: ChainTopic): StudentTopicDetail {
  const statuses = lessonStatuses(entry, progress);
  const { topic, section } = entry;
  return {
    id: topic.id,
    title: topic.title,
    description: topic.description,
    icon: topic.icon,
    status: entry.status,
    section: { id: section.id, title: section.title },
    skills: topic.skills,
    lessons: topic.lessons.map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      estMinutes: lesson.estMinutes,
      status: statuses[index] ?? LessonStatus.LOCKED,
    })),
    lessonsCompleted: countCompletedLessons(topic, progress),
  };
}

function lessonDetail({ entry, index, status }: LessonLocation): StudentLesson {
  const lessons = entry.topic.lessons;
  const lesson = lessons[index];
  if (lesson === undefined) {
    throw notFound();
  }
  const row = progress.get(lesson.id);
  return {
    id: lesson.id,
    title: lesson.title,
    contentMd: lesson.contentMd,
    videoUrl: lesson.videoUrl,
    estMinutes: lesson.estMinutes,
    status,
    topic: { id: entry.topic.id, title: entry.topic.title },
    prevLessonId: lessons[index - 1]?.id ?? null,
    nextLessonId: lessons[index + 1]?.id ?? null,
    startedAt: row?.startedAt ?? null,
    completedAt: row?.completedAt ?? null,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function ensureStarted(lessonId: string): MockLessonProgress {
  const existing = progress.get(lessonId);
  if (existing !== undefined) {
    return existing;
  }
  const row: MockLessonProgress = {
    status: LessonStatus.IN_PROGRESS,
    startedAt: nowIso(),
    completedAt: null,
  };
  progress.set(lessonId, row);
  return row;
}

function topicStatusOf(topicId: string): TopicStatus {
  return chain().find((item) => item.topic.id === topicId)?.status ?? TopicStatus.LOCKED;
}

/** Zanjirda berilgan darsdan keyingi ochiq (qulflanmagan) dars. */
function nextOpenLesson(lessonId: string): NextLessonRef | null {
  const flat = chain().flatMap((entry) => {
    const statuses = lessonStatuses(entry, progress);
    return entry.topic.lessons.map((lesson, index) => ({
      topicId: entry.topic.id,
      lessonId: lesson.id,
      status: statuses[index],
    }));
  });
  const position = flat.findIndex((item) => item.lessonId === lessonId);
  const next = flat.slice(position + 1).find((item) => item.status !== LessonStatus.LOCKED);
  return next === undefined ? null : { topicId: next.topicId, lessonId: next.lessonId };
}

function startLesson(lessonId: string): LessonStartResponse {
  const { entry } = findLesson(lessonId);
  const row = ensureStarted(lessonId);
  return {
    lessonId,
    lessonStatus: row.status,
    topicStatus: topicStatusOf(entry.topic.id),
    startedAt: row.startedAt,
  };
}

function completeLesson(lessonId: string): LessonCompleteResponse {
  const { entry } = findLesson(lessonId);
  const row = ensureStarted(lessonId);
  if (row.status !== LessonStatus.COMPLETED) {
    progress.set(lessonId, { ...row, status: LessonStatus.COMPLETED, completedAt: nowIso() });
  }
  return {
    lessonStatus: LessonStatus.COMPLETED,
    topicStatus: topicStatusOf(entry.topic.id),
    rewards: [],
    next: nextOpenLesson(lessonId),
  };
}

/** Sinxron hisobni Promise'ga o'raydi: xato — rad etilgan Promise (haqiqiy API kabi). */
function respond<T>(compute: () => T): Promise<T> {
  try {
    return Promise.resolve(structuredClone(compute()));
  } catch (error) {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
}

export const learningPathMockApi: LearningPathApi = {
  getPathMap: () => respond(() => buildPathMap(MOCK_PATH, progress)),
  getTopic: (topicId) => respond(() => topicDetail(findTopic(topicId))),
  getLesson: (lessonId) => respond(() => lessonDetail(findLesson(lessonId))),
  startLesson: (lessonId) => respond(() => startLesson(lessonId)),
  completeLesson: (lessonId) => respond(() => completeLesson(lessonId)),
};
