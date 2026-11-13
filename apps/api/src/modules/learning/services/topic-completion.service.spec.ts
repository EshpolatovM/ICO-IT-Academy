import { chainPath, fakeTransaction, snapshot, topic } from '../testing/learning.fixtures.js';

import { PathUnlockCalculator } from './path-unlock-calculator.js';
import { TopicCompletionService } from './topic-completion.service.js';

import type { ProgressSnapshot, StudentPathState } from '../learning.types.js';
import type { LearningTransaction } from './learning-transaction.service.js';
import type { EnrollmentsRepository } from '../repositories/enrollments.repository.js';
import type { LessonProgressRepository } from '../repositories/lesson-progress.repository.js';
import type { TopicProgressRepository } from '../repositories/topic-progress.repository.js';

const AT = new Date('2026-11-02T09:00:00.000Z');
const calculator = new PathUnlockCalculator();
const path = chainPath(topic('t1', 2), topic('t2'));
const chain = calculator.chain(path);
const [t1, t2] = chain as [(typeof chain)[number], (typeof chain)[number]];

interface Counts {
  lessonsCompleted: number;
  transitioned?: boolean;
  topicsCompleted?: number;
}

function setup({ lessonsCompleted, transitioned = true, topicsCompleted = 0 }: Counts) {
  const transaction = fakeTransaction();
  const topicProgress = {
    markCompleted: jest.fn().mockResolvedValue(transitioned),
    upsertAvailable: jest.fn().mockResolvedValue(undefined),
    countCompleted: jest.fn().mockResolvedValue(topicsCompleted),
    startTopic: jest.fn().mockResolvedValue(undefined),
    lockForUpdate: jest.fn().mockResolvedValue(undefined),
  };
  const lessonProgress = { countCompleted: jest.fn().mockResolvedValue(lessonsCompleted) };
  const enrollments = { markCompleted: jest.fn().mockResolvedValue(undefined) };
  const service = new TopicCompletionService(
    transaction as unknown as LearningTransaction,
    topicProgress as unknown as TopicProgressRepository,
    lessonProgress as unknown as LessonProgressRepository,
    enrollments as unknown as EnrollmentsRepository,
  );
  return { service, transaction, topicProgress, enrollments };
}

function stateOf(
  progress: ProgressSnapshot,
  enrollmentCompletedAt: Date | null = null,
): StudentPathState {
  return {
    studentId: 's1',
    path,
    chain,
    progress,
    unlock: calculator.calculate(path, progress),
    enrollmentCompletedAt,
  };
}

describe('TopicCompletionService', () => {
  const target = { studentId: 's1', pathId: 'p1', chain, topic: t1 };

  it("shart: ko'rinadigan darslar > 0 va hammasi yakunlangan", () => {
    const { service } = setup({ lessonsCompleted: 0 });

    expect(service.isTopicSatisfied(2, 2)).toBe(true);
    expect(service.isTopicSatisfied(2, 1)).toBe(false);
    expect(service.isTopicSatisfied(0, 0)).toBe(false);
  });

  it("darslar yakunlanmagan — o'tish yo'q", async () => {
    const { service, topicProgress } = setup({ lessonsCompleted: 1 });

    await expect(service.evaluate(target, AT)).resolves.toEqual([]);
    expect(topicProgress.markCompleted).not.toHaveBeenCalled();
  });

  it('oxirgi dars — mavzu COMPLETED, keyingi AVAILABLE, topic.completed hodisasi', async () => {
    const { service, topicProgress, enrollments } = setup({
      lessonsCompleted: 2,
      topicsCompleted: 1,
    });

    await expect(service.evaluate(target, AT)).resolves.toEqual([
      {
        name: 'topic.completed',
        payload: { studentId: 's1', topicId: 't1', pathId: 'p1', completedAt: AT },
      },
    ]);
    expect(topicProgress.markCompleted).toHaveBeenCalledWith('s1', 't1', AT);
    expect(topicProgress.upsertAvailable).toHaveBeenCalledWith('s1', 't2');
    expect(enrollments.markCompleted).not.toHaveBeenCalled();
  });

  it("allaqachon COMPLETED (parallel o'tish) — hodisa yo'q", async () => {
    const { service, topicProgress } = setup({ lessonsCompleted: 2, transitioned: false });

    await expect(service.evaluate(target, AT)).resolves.toEqual([]);
    expect(topicProgress.upsertAvailable).not.toHaveBeenCalled();
  });

  it("oxirgi mavzu — keyingi qator yo'q, barcha mavzular yakunlangan — enrollment completed_at", async () => {
    const { service, topicProgress, enrollments } = setup({
      lessonsCompleted: 1,
      topicsCompleted: 2,
    });

    await service.evaluate({ ...target, topic: t2 }, AT);
    expect(topicProgress.upsertAvailable).not.toHaveBeenCalled();
    expect(enrollments.markCompleted).toHaveBeenCalledWith('s1', 'p1');
  });

  it("reconcile: sharti bajarilgan, lekin COMPLETED bo'lmagan mavzu yakunlanadi (tranzaksiyada, hodisa bilan)", async () => {
    const { service, transaction, topicProgress } = setup({
      lessonsCompleted: 1,
      topicsCompleted: 1,
    });
    const visibleT1 = { ...t1, lessons: t1.lessons.slice(0, 1) };
    const reducedPath = chainPath(visibleT1, t2);
    const progress = snapshot({ t1: 'IN_PROGRESS' }, { 't1-l1': 'COMPLETED' });
    const state = {
      ...stateOf(progress),
      path: reducedPath,
      chain: calculator.chain(reducedPath),
      unlock: calculator.calculate(reducedPath, progress),
    };

    expect(service.needsReconcile(state)).toBe(true);
    await service.reconcile(state);
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(topicProgress.lockForUpdate).toHaveBeenCalledWith('s1', 't1');
    expect(topicProgress.upsertAvailable).toHaveBeenCalledWith('s1', 't2');
    expect(transaction.published).toHaveLength(1);
  });

  it('reconcile kerak emas: oddiy holat; kerak: hammasi COMPLETED, enrollment yakunlanmagan', () => {
    const { service } = setup({ lessonsCompleted: 0 });

    expect(
      service.needsReconcile(stateOf(snapshot({ t1: 'IN_PROGRESS' }, { 't1-l1': 'COMPLETED' }))),
    ).toBe(false);
    const done = snapshot({ t1: 'COMPLETED', t2: 'COMPLETED' });
    expect(service.needsReconcile(stateOf(done, AT))).toBe(false);
    expect(service.needsReconcile(stateOf(done, null))).toBe(true);
  });
});
