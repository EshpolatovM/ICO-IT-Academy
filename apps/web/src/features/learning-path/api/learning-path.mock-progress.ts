import { ChestStatus, LessonStatus, PathNodeKind, TopicStatus } from '../types/learning-path.types';

import type {
  MockLessonProgress,
  MockPath,
  MockSection,
  MockTopic,
} from './learning-path.mock-data';
import type {
  StudentPathMap,
  StudentPathNode,
  StudentPathSection,
} from '../types/learning-path.types';

/*
 * Mock uchun soddalashtirilgan ochish qoidalari (3.3 §4.3, S-35 siz): mavzu oldingisi
 * tugaganda, dars oldingi dars tugaganda ochiladi; sandiq — mavzusi tugaganda READY.
 */

export type ProgressMap = ReadonlyMap<string, MockLessonProgress>;

export interface ChainTopic {
  topic: MockTopic;
  section: MockSection;
  status: TopicStatus;
}

function recordedTopicStatus(topic: MockTopic, progress: ProgressMap): TopicStatus | null {
  const rows = topic.lessons.map((lesson) => progress.get(lesson.id));
  if (rows.length > 0 && rows.every((row) => row?.status === LessonStatus.COMPLETED)) {
    return TopicStatus.COMPLETED;
  }
  return rows.some((row) => row !== undefined) ? TopicStatus.IN_PROGRESS : null;
}

/** Ko'rinadigan zanjir (bo'limlar → mavzular) holatlari bilan. */
export function buildChain(path: MockPath, progress: ProgressMap): ChainTopic[] {
  const chain: ChainTopic[] = [];
  for (const section of path.sections) {
    for (const topic of section.topics) {
      const previous = chain.at(-1);
      const unlocked = previous === undefined || previous.status === TopicStatus.COMPLETED;
      const status =
        recordedTopicStatus(topic, progress) ??
        (unlocked ? TopicStatus.AVAILABLE : TopicStatus.LOCKED);
      chain.push({ topic, section, status });
    }
  }
  return chain;
}

/** Mavzu darslarining holatlari (`topic.lessons` tartibida). */
export function lessonStatuses(entry: ChainTopic, progress: ProgressMap): LessonStatus[] {
  const statuses: LessonStatus[] = [];
  for (const lesson of entry.topic.lessons) {
    const previous = statuses.at(-1);
    const row = progress.get(lesson.id);
    if (entry.status === TopicStatus.LOCKED) {
      statuses.push(LessonStatus.LOCKED);
    } else if (row !== undefined) {
      statuses.push(row.status);
    } else {
      const unlocked = previous === undefined || previous === LessonStatus.COMPLETED;
      statuses.push(unlocked ? LessonStatus.AVAILABLE : LessonStatus.LOCKED);
    }
  }
  return statuses;
}

export function countCompletedLessons(topic: MockTopic, progress: ProgressMap): number {
  return topic.lessons.filter(
    (lesson) => progress.get(lesson.id)?.status === LessonStatus.COMPLETED,
  ).length;
}

function completedShare(entries: readonly ChainTopic[]): number {
  if (entries.length === 0) {
    return 0;
  }
  const completed = entries.filter((entry) => entry.status === TopicStatus.COMPLETED).length;
  return completed / entries.length;
}

function sectionNodes(entries: readonly ChainTopic[], progress: ProgressMap): StudentPathNode[] {
  return entries.flatMap(({ topic, status }): StudentPathNode[] => {
    const node: StudentPathNode = {
      kind: PathNodeKind.TOPIC,
      id: topic.id,
      title: topic.title,
      icon: topic.icon,
      status,
      lessons: topic.lessons.length,
      lessonsCompleted: countCompletedLessons(topic, progress),
    };
    if (topic.chestAfter === null) {
      return [node];
    }
    const chestStatus = status === TopicStatus.COMPLETED ? ChestStatus.READY : ChestStatus.LOCKED;
    return [node, { kind: PathNodeKind.CHEST, ...topic.chestAfter, status: chestStatus }];
  });
}

/** `GET /student/path` javobi. */
export function buildPathMap(path: MockPath, progress: ProgressMap): StudentPathMap {
  const chain = buildChain(path, progress);
  const sections: StudentPathSection[] = path.sections.map((section) => {
    const entries = chain.filter((entry) => entry.section.id === section.id);
    return {
      id: section.id,
      title: section.title,
      progress: completedShare(entries),
      nodes: sectionNodes(entries, progress),
    };
  });
  return {
    path: { id: path.id, title: path.title, progress: completedShare(chain) },
    reviewBlock: { blocked: false, dueCount: 0 },
    sections,
  };
}
