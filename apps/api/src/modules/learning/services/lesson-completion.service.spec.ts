import { chainPath, fakeTransaction, snapshot, topic } from '../testing/learning.fixtures.js';

import { LessonCompletionService } from './lesson-completion.service.js';
import { PathUnlockCalculator } from './path-unlock-calculator.js';

import type { ProgressSnapshot } from '../learning.types.js';
import type { LearningTransaction } from './learning-transaction.service.js';
import type { LessonAccess, LessonAccessGuardService } from './lesson-access-guard.service.js';
import type { LessonProgressWriter } from './lesson-progress-writer.service.js';
import type { LessonStartService } from './lesson-start.service.js';
import type { TopicCompletionService } from './topic-completion.service.js';

const calculator = new PathUnlockCalculator();
const path = chainPath(topic('t1', 2), topic('t2'));
const chain = calculator.chain(path);

function accessOf(lessonId: string, progress: ProgressSnapshot): LessonAccess {
  const unlock = calculator.calculate(path, progress);
  const owner = chain.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
  const lessonIndex = owner?.lessons.findIndex((lesson) => lesson.id === lessonId) ?? -1;
  const lesson = owner?.lessons[lessonIndex];
  if (!owner || !lesson) {
    throw new Error('fixture');
  }
  return {
    state: { studentId: 's1', path, chain, progress, unlock, enrollmentCompletedAt: null },
    topic: owner,
    topicStatus: unlock.topics.get(owner.id) ?? 'LOCKED',
    lesson,
    lessonIndex,
    lessonStatus: unlock.lessons.get(lessonId) ?? 'LOCKED',
  };
}

interface Options {
  completes?: boolean;
  topicStatus?: string;
  topicEvents?: unknown[];
}

function setup(access: LessonAccess, options: Options = {}) {
  const { completes = true, topicStatus = 'IN_PROGRESS', topicEvents = [] } = options;
  const guard = { lesson: jest.fn().mockResolvedValue(access) };
  const starter = { assertGateOpen: jest.fn().mockResolvedValue(undefined) };
  const transaction = fakeTransaction();
  const writer = {
    start: jest.fn().mockResolvedValue(undefined),
    complete: jest.fn().mockResolvedValue(completes),
    topicStatus: jest.fn().mockResolvedValue(topicStatus),
  };
  const topicCompletion = { evaluate: jest.fn().mockResolvedValue(topicEvents) };
  const service = new LessonCompletionService(
    guard as unknown as LessonAccessGuardService,
    starter as unknown as LessonStartService,
    transaction as unknown as LearningTransaction,
    writer as unknown as LessonProgressWriter,
    topicCompletion as unknown as TopicCompletionService,
  );
  return { service, starter, transaction, writer, topicCompletion };
}

describe('LessonCompletionService', () => {
  it("allaqachon yakunlangan dars — idempotent 200: rewards [], yozuv va hodisa yo'q", async () => {
    const access = accessOf('t1-l1', snapshot({ t1: 'IN_PROGRESS' }, { 't1-l1': 'COMPLETED' }));
    const { service, transaction } = setup(access);

    await expect(service.complete('s1', 't1-l1')).resolves.toEqual({
      lessonStatus: 'COMPLETED',
      topicStatus: 'IN_PROGRESS',
      rewards: [],
      next: { topicId: 't1', lessonId: 't1-l2' },
    });
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it('boshlanmagan dars — avval start qoidalari (ReviewGate) va shu tranzaksiyada start', async () => {
    const { service, starter, writer } = setup(accessOf('t1-l1', snapshot()));

    await service.complete('s1', 't1-l1');
    expect(starter.assertGateOpen).toHaveBeenCalledWith('s1');
    expect(writer.start).toHaveBeenCalledWith('s1', 't1-l1', 't1');
  });

  it('boshlangan dars — gate tekshirilmaydi; lesson.completed hodisasi', async () => {
    const access = accessOf('t1-l1', snapshot({ t1: 'IN_PROGRESS' }, { 't1-l1': 'IN_PROGRESS' }));
    const { service, starter, transaction } = setup(access);

    await service.complete('s1', 't1-l1');
    expect(starter.assertGateOpen).not.toHaveBeenCalled();
    expect(transaction.published).toEqual([
      expect.objectContaining({
        name: 'lesson.completed',
        payload: expect.objectContaining({
          lessonId: 't1-l1',
          topicId: 't1',
          pathId: 'p1',
        }) as unknown,
      }),
    ]);
  });

  it('oxirgi dars — mavzu COMPLETED, next — keyingi mavzuning 1-darsi, topic.completed ham chiqadi', async () => {
    const access = accessOf(
      't1-l2',
      snapshot({ t1: 'IN_PROGRESS' }, { 't1-l1': 'COMPLETED', 't1-l2': 'IN_PROGRESS' }),
    );
    const topicEvent = { name: 'topic.completed', payload: {} };
    const { service, transaction } = setup(access, {
      topicStatus: 'COMPLETED',
      topicEvents: [topicEvent],
    });

    await expect(service.complete('s1', 't1-l2')).resolves.toMatchObject({
      topicStatus: 'COMPLETED',
      next: { topicId: 't2', lessonId: 't2-l1' },
    });
    expect(transaction.published).toHaveLength(2);
  });

  it("parallel complete (0 qator) — hodisa yo'q, mavzu baholanmaydi", async () => {
    const access = accessOf('t1-l1', snapshot({ t1: 'IN_PROGRESS' }, { 't1-l1': 'IN_PROGRESS' }));
    const { service, transaction, topicCompletion } = setup(access, { completes: false });

    await service.complete('s1', 't1-l1');
    expect(topicCompletion.evaluate).not.toHaveBeenCalled();
    expect(transaction.published).toEqual([]);
  });

  it('zanjir oxiri — next null', async () => {
    const access = accessOf(
      't2-l1',
      snapshot({ t1: 'COMPLETED', t2: 'IN_PROGRESS' }, { 't2-l1': 'IN_PROGRESS' }),
    );
    const { service } = setup(access, { topicStatus: 'COMPLETED' });

    await expect(service.complete('s1', 't2-l1')).resolves.toMatchObject({ next: null });
  });
});
