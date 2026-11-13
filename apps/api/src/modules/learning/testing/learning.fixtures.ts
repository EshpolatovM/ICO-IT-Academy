import type {
  LessonProgressRecord,
  ProgressSnapshot,
  RecordedLessonStatus,
  RecordedTopicStatus,
  VisibleChest,
  VisiblePath,
  VisibleSection,
  VisibleTopic,
} from '../learning.types.js';

/** Unit testlar uchun ko'rinadigan tuzilma va progress quruvchilari (DB'siz). */

export const STARTED_AT = new Date('2026-11-01T10:00:00.000Z');
export const COMPLETED_AT = new Date('2026-11-01T11:00:00.000Z');

/** Mavzu: darslari `${id}-l1`, `${id}-l2`, ... (standart — bitta dars). */
export function topic(id: string, lessonCount = 1, sectionId = 's1'): VisibleTopic {
  return {
    id,
    sectionId,
    title: `Mavzu ${id}`,
    description: null,
    icon: null,
    skills: [],
    lessons: Array.from({ length: lessonCount }, (_, index) => ({
      id: `${id}-l${String(index + 1)}`,
      title: `Dars ${String(index + 1)}`,
      estMinutes: null,
    })),
  };
}

export function section(
  id: string,
  topics: VisibleTopic[],
  chests: VisibleChest[] = [],
): VisibleSection {
  return { id, title: `Bo'lim ${id}`, topics, chests };
}

export function pathOf(...sections: VisibleSection[]): VisiblePath {
  return { id: 'p1', title: "Yo'l", sections };
}

/** Bitta bo'limli yo'l. */
export function chainPath(...topics: VisibleTopic[]): VisiblePath {
  return pathOf(section('s1', topics));
}

function lessonRecord(status: RecordedLessonStatus): LessonProgressRecord {
  return {
    status,
    startedAt: STARTED_AT,
    completedAt: status === 'COMPLETED' ? COMPLETED_AT : null,
  };
}

export function snapshot(
  topics: Record<string, RecordedTopicStatus> = {},
  lessons: Record<string, RecordedLessonStatus> = {},
): ProgressSnapshot {
  return {
    topics: new Map(Object.entries(topics)),
    lessons: new Map(
      Object.entries(lessons).map(([id, status]) => [id, lessonRecord(status)] as const),
    ),
  };
}

/** `LearningTransaction` o'rnini bosuvchi: ishni darhol bajaradi, hodisalarni yig'adi. */
export function fakeTransaction() {
  const published: unknown[] = [];
  const commit = jest.fn(
    async <T>(
      _studentId: string,
      work: () => Promise<{ result: T; events: readonly unknown[] }>,
    ) => {
      const { result, events } = await work();
      published.push(...events);
      return result;
    },
  );
  return { commit, published };
}
