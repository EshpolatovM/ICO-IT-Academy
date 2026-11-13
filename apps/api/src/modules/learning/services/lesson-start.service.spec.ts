import { ErrorCode } from '@lms/shared';

import {
  chainPath,
  fakeTransaction,
  snapshot,
  STARTED_AT,
  topic,
} from '../testing/learning.fixtures.js';

import { LessonStartService } from './lesson-start.service.js';
import { PathUnlockCalculator } from './path-unlock-calculator.js';

import type { ProgressSnapshot } from '../learning.types.js';
import type { LearningTransaction } from './learning-transaction.service.js';
import type { LessonAccess, LessonAccessGuardService } from './lesson-access-guard.service.js';
import type { LessonProgressWriter } from './lesson-progress-writer.service.js';
import type { ReviewGateResult } from './review-gate.js';

const calculator = new PathUnlockCalculator();

function accessOf(progress: ProgressSnapshot): LessonAccess {
  const path = chainPath(topic('t1', 2));
  const unlock = calculator.calculate(path, progress);
  const [first] = calculator.chain(path);
  if (!first?.lessons[0]) {
    throw new Error('fixture');
  }
  return {
    state: { studentId: 's1', path, chain: [first], progress, unlock, enrollmentCompletedAt: null },
    topic: first,
    topicStatus: unlock.topics.get('t1') ?? 'LOCKED',
    lesson: first.lessons[0],
    lessonIndex: 0,
    lessonStatus: unlock.lessons.get('t1-l1') ?? 'LOCKED',
  };
}

function setup(progress: ProgressSnapshot, gateResult: ReviewGateResult = { allowed: true }) {
  const access = { lesson: jest.fn().mockResolvedValue(accessOf(progress)) };
  const gate = { check: jest.fn().mockResolvedValue(gateResult), status: jest.fn() };
  const transaction = fakeTransaction();
  const writer = {
    start: jest.fn().mockResolvedValue(undefined),
    lesson: jest
      .fn()
      .mockResolvedValue({ status: 'IN_PROGRESS', startedAt: STARTED_AT, completedAt: null }),
    topicStatus: jest.fn().mockResolvedValue('IN_PROGRESS'),
  };
  const service = new LessonStartService(
    access as unknown as LessonAccessGuardService,
    gate,
    transaction as unknown as LearningTransaction,
    writer as unknown as LessonProgressWriter,
  );
  return { service, gate, transaction, writer };
}

describe('LessonStartService', () => {
  it("boshlangan/yakunlangan dars — idempotent, yozuv yo'q, gate tekshirilmaydi", async () => {
    const { service, transaction, gate } = setup(
      snapshot({ t1: 'COMPLETED' }, { 't1-l1': 'COMPLETED' }),
    );

    await expect(service.start('s1', 't1-l1')).resolves.toEqual({
      lessonId: 't1-l1',
      lessonStatus: 'COMPLETED',
      topicStatus: 'COMPLETED',
      startedAt: STARTED_AT.toISOString(),
    });
    expect(transaction.commit).not.toHaveBeenCalled();
    expect(gate.check).not.toHaveBeenCalled();
  });

  it("ReviewGate bloklasa — 409 REVIEW_REQUIRED + due ro'yxati, yozuv yo'q", async () => {
    const due = [{ topicId: 't0', title: 'Teglar' }];
    const { service, transaction } = setup(snapshot(), { allowed: false, due });

    await expect(service.start('s1', 't1-l1')).rejects.toMatchObject({
      code: ErrorCode.REVIEW_REQUIRED,
      status: 409,
      details: { due },
    });
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it('yangi dars — tranzaksiyada dars va mavzu boshlanadi (COMPLETED mavzuga writer tegmaydi)', async () => {
    const { service, writer, transaction } = setup(snapshot({ t1: 'AVAILABLE' }));

    await expect(service.start('s1', 't1-l1')).resolves.toEqual({
      lessonId: 't1-l1',
      lessonStatus: 'IN_PROGRESS',
      topicStatus: 'IN_PROGRESS',
      startedAt: STARTED_AT.toISOString(),
    });
    expect(transaction.commit).toHaveBeenCalledWith('s1', expect.any(Function));
    expect(writer.start).toHaveBeenCalledWith('s1', 't1-l1', 't1');
  });
});
