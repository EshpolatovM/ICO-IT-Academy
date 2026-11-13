import { ContentTransaction } from './content-transaction.service.js';

import type { ContentCacheVersion } from './content-cache-version.service.js';
import type { UnitOfWork } from '../../../common/transaction/unit-of-work.js';

function setup() {
  const order: string[] = [];
  const unitOfWork = {
    run: jest.fn(async <T>(work: () => Promise<T>) => {
      const result = await work();
      order.push('commit');
      return result;
    }),
  };
  const version = {
    bump: jest.fn(() => {
      order.push('bump');
      return Promise.resolve();
    }),
  };
  const transaction = new ContentTransaction(
    unitOfWork as unknown as UnitOfWork,
    version as unknown as ContentCacheVersion,
  );
  return { transaction, version, order };
}

describe('ContentTransaction', () => {
  it("natija qaytadi; versiya commit'dan KEYIN, o'zgargan yo'llar bilan", async () => {
    const { transaction, version, order } = setup();

    await expect(
      transaction.commit(() => Promise.resolve({ result: 7, changedPathIds: ['p1'] })),
    ).resolves.toBe(7);
    expect(version.bump).toHaveBeenCalledWith(['p1']);
    expect(order).toEqual(['commit', 'bump']);
  });

  it("xato (rollback) — bump yo'q, xato uzatiladi", async () => {
    const { transaction, version } = setup();

    await expect(transaction.commit(() => Promise.reject(new Error('x')))).rejects.toThrow('x');
    expect(version.bump).not.toHaveBeenCalled();
  });
});
