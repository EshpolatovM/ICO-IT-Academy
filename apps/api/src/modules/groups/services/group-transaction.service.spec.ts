import { GroupTransaction } from './group-transaction.service.js';

import type { MentorScopeCache } from './mentor-scope-cache.service.js';
import type { UnitOfWork } from '../../../common/transaction/unit-of-work.js';

function setup() {
  const calls: string[] = [];
  const unitOfWork = {
    run: jest.fn(async <T>(work: () => Promise<T>) => {
      const result = await work();
      calls.push('commit');
      return result;
    }),
  };
  const scopeCache = {
    invalidate: jest.fn(() => {
      calls.push('invalidate');
      return Promise.resolve();
    }),
  };
  const transaction = new GroupTransaction(
    unitOfWork as unknown as UnitOfWork,
    scopeCache as unknown as MentorScopeCache,
  );
  return { transaction, scopeCache, calls };
}

describe('GroupTransaction', () => {
  it('tranzaksiyadan keyin `work` qaytargan mentorlar keshi invalidatsiya qilinadi, natija qaytadi', async () => {
    const { transaction, scopeCache, calls } = setup();

    await expect(
      transaction.commit(() => Promise.resolve({ result: 42, affectedMentorIds: ['m1', null] })),
    ).resolves.toBe(42);
    expect(calls).toEqual(['commit', 'invalidate']);
    expect(scopeCache.invalidate).toHaveBeenCalledWith('m1', null);
  });

  it("tranzaksiya yiqilsa — invalidatsiya yo'q", async () => {
    const { transaction, scopeCache } = setup();

    await expect(transaction.commit(() => Promise.reject(new Error('xato')))).rejects.toThrow(
      'xato',
    );
    expect(scopeCache.invalidate).not.toHaveBeenCalled();
  });
});
