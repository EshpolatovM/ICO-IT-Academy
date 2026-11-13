import { PathEnrollmentService } from './path-enrollment.service.js';

import type { LearningTransaction } from './learning-transaction.service.js';
import type { EnrollmentsRepository } from '../repositories/enrollments.repository.js';
import type { TopicProgressRepository } from '../repositories/topic-progress.repository.js';

function setup(existing: { completedAt: Date | null } | null) {
  const inTransaction = { value: false };
  const transaction = {
    commit: jest.fn(async (_studentId: string, work: () => Promise<{ result: unknown }>) => {
      inTransaction.value = true;
      const { result } = await work();
      inTransaction.value = false;
      return result;
    }),
  };
  const enrollments = {
    find: jest.fn().mockResolvedValueOnce(existing).mockResolvedValue({ completedAt: null }),
    ensure: jest.fn(() => {
      expect(inTransaction.value).toBe(true);
      return Promise.resolve();
    }),
  };
  const topicProgress = {
    upsertAvailable: jest.fn(() => {
      expect(inTransaction.value).toBe(true);
      return Promise.resolve();
    }),
  };
  const service = new PathEnrollmentService(
    transaction as unknown as LearningTransaction,
    enrollments as unknown as EnrollmentsRepository,
    topicProgress as unknown as TopicProgressRepository,
  );
  return { service, transaction, enrollments, topicProgress };
}

describe('PathEnrollmentService', () => {
  it("tez yo'l: enrollment bor — yozuv yo'q", async () => {
    const { service, transaction } = setup({ completedAt: null });

    await expect(service.ensure('s1', 'p1', 't1')).resolves.toEqual({ completedAt: null });
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it('birinchi murojaat: bitta tranzaksiyada enrollment + 1-mavzu AVAILABLE (idempotent yozuvlar)', async () => {
    const { service, transaction, enrollments, topicProgress } = setup(null);

    await service.ensure('s1', 'p1', 't1');
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(enrollments.ensure).toHaveBeenCalledWith('s1', 'p1');
    expect(topicProgress.upsertAvailable).toHaveBeenCalledWith('s1', 't1');
  });

  it("ko'rinadigan mavzu yo'q — faqat enrollment", async () => {
    const { service, topicProgress } = setup(null);

    await service.ensure('s1', 'p1', null);
    expect(topicProgress.upsertAvailable).not.toHaveBeenCalled();
  });
});
