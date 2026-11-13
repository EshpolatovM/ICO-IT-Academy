import { Injectable } from '@nestjs/common';

import { ChestStatus, LessonStatus, TopicStatus } from '@lms/shared';

import type {
  PathUnlockState,
  ProgressSnapshot,
  VisiblePath,
  VisibleTopic,
} from '../learning.types.js';

/** Mavzu va dars holatlari qiymatlari bir xil (`LOCKED`/`AVAILABLE`/`IN_PROGRESS`/`COMPLETED`). */
type ChainStatus = TopicStatus;

/** S-35: faqat HAQIQIY progress (boshlangan yoki yakunlangan) keyingi qatorlarni ochadi (🔴-1). */
const REAL_PROGRESS: ReadonlySet<ChainStatus> = new Set([
  TopicStatus.IN_PROGRESS,
  TopicStatus.COMPLETED,
]);

/** Ochiq mavzu — `currentTopicId` nomzodi (R Q-4). */
const OPEN_TOPIC: ReadonlySet<ChainStatus> = new Set([
  TopicStatus.AVAILABLE,
  TopicStatus.IN_PROGRESS,
]);

/** `result[i]` — `i` dan keyingi elementlardan birortasida haqiqiy progress bormi. */
function realProgressAfter(recorded: readonly (ChainStatus | undefined)[]): boolean[] {
  const result: boolean[] = [];
  let seen = false;
  for (let i = recorded.length - 1; i >= 0; i -= 1) {
    result[i] = seen;
    const status = recorded[i];
    seen = seen || (status !== undefined && REAL_PROGRESS.has(status));
  }
  return result;
}

interface ChainPosition {
  recorded: ChainStatus | undefined;
  index: number;
  previous: ChainStatus | undefined;
  progressAfter: boolean;
}

function resolveOne({ recorded, index, previous, progressAfter }: ChainPosition): ChainStatus {
  if (recorded !== undefined) {
    return recorded;
  }
  if (index === 0 || previous === TopicStatus.COMPLETED || progressAfter) {
    return TopicStatus.AVAILABLE;
  }
  return TopicStatus.LOCKED;
}

/**
 * Zanjir holatlari (3.3 §4.3) — mavzular va bitta mavzu darslari uchun bir xil qoida: yozilgan holat
 * (hech qachon pasaymaydi) → birinchi element → oldingisi `COMPLETED` → keyinroq haqiqiy progress
 * bor → aks holda `LOCKED`.
 */
export function resolveChain(recorded: readonly (ChainStatus | undefined)[]): ChainStatus[] {
  const progressAfter = realProgressAfter(recorded);
  const statuses: ChainStatus[] = [];
  recorded.forEach((status, index) => {
    statuses.push(
      resolveOne({
        recorded: status,
        index,
        previous: statuses[index - 1],
        progressAfter: progressAfter[index] ?? false,
      }),
    );
  });
  return statuses;
}

/**
 * Ochish algoritmi (3.3 §4.3, R Q-4) — sof funksiyalar (DB/Redis'siz), 14-modul (ota-ona paneli) ham
 * qayta ishlatadi. Kirish — ko'rinadigan tuzilma va progress qatorlari; `LOCKED` hech qachon
 * yozilmaydi, faqat shu yerda hisoblanadi.
 */
@Injectable()
export class PathUnlockCalculator {
  /** Ko'rinadigan zanjir: bo'limlar, ichida mavzular (`order`) — bitta chiziq; darssiz mavzu kirmaydi (T-2). */
  chain(path: VisiblePath): VisibleTopic[] {
    return path.sections
      .flatMap((section) => section.topics)
      .filter((topic) => topic.lessons.length > 0);
  }

  calculate(path: VisiblePath, progress: ProgressSnapshot): PathUnlockState {
    const chain = this.chain(path);
    const topicStatuses = resolveChain(chain.map((topic) => progress.topics.get(topic.id)));
    const topics = new Map(
      chain.map((topic, index) => [topic.id, topicStatuses[index] ?? TopicStatus.LOCKED]),
    );
    const lessons = new Map<string, LessonStatus>();
    for (const topic of chain) {
      this.resolveLessons(topic, topics.get(topic.id), progress).forEach((status, id) =>
        lessons.set(id, status),
      );
    }
    return {
      topics,
      lessons,
      chests: this.resolveChests(path, topics),
      currentTopicId: this.currentTopicId(chain, topics),
    };
  }

  private resolveLessons(
    topic: VisibleTopic,
    topicStatus: TopicStatus | undefined,
    progress: ProgressSnapshot,
  ): Map<string, LessonStatus> {
    const statuses =
      topicStatus === undefined || topicStatus === TopicStatus.LOCKED
        ? topic.lessons.map(() => LessonStatus.LOCKED)
        : resolveChain(topic.lessons.map((lesson) => progress.lessons.get(lesson.id)?.status));
    return new Map(
      topic.lessons.map((lesson, index) => [lesson.id, statuses[index] ?? LessonStatus.LOCKED]),
    );
  }

  /** Sandiq `after_topic` ko'rinsa ko'rinadi (TL Q-1): `COMPLETED` → `READY`, aks holda `LOCKED`. */
  private resolveChests(
    path: VisiblePath,
    topics: ReadonlyMap<string, TopicStatus>,
  ): Map<string, ChestStatus> {
    const chests = new Map<string, ChestStatus>();
    for (const chest of path.sections.flatMap((section) => section.chests)) {
      const after = topics.get(chest.afterTopicId);
      if (after !== undefined) {
        chests.set(
          chest.id,
          after === TopicStatus.COMPLETED ? ChestStatus.READY : ChestStatus.LOCKED,
        );
      }
    }
    return chests;
  }

  /** Ochiq (`AVAILABLE`/`IN_PROGRESS`) mavzulardan zanjirda eng oxirgisi ("front"); yo'q — `null`. */
  private currentTopicId(
    chain: readonly VisibleTopic[],
    topics: ReadonlyMap<string, TopicStatus>,
  ): string | null {
    for (let i = chain.length - 1; i >= 0; i -= 1) {
      const topic = chain[i];
      const status = topic ? topics.get(topic.id) : undefined;
      if (topic && status !== undefined && OPEN_TOPIC.has(status)) {
        return topic.id;
      }
    }
    return null;
  }
}
