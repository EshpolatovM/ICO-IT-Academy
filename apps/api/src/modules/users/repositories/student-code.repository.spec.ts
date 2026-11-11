import { StudentCodeRepository } from './student-code.repository.js';

import type { RawQueryClient } from './student-code.repository.js';

function clientReturning(rows: { value: bigint }[]): RawQueryClient {
  return { $queryRaw: jest.fn().mockResolvedValue(rows) };
}

describe('StudentCodeRepository', () => {
  const repository = new StudentCodeRepository();

  it('sequence qiymatidan ST- kodini yasaydi', async () => {
    await expect(repository.next(clientReturning([{ value: 10_001n }]))).resolves.toBe('ST-10001');
  });

  it('sequence qiymat qaytarmasa xato', async () => {
    await expect(repository.next(clientReturning([]))).rejects.toThrow(/student_code_seq/);
  });

  it("nextMany: bir nechta kod o'sish tartibida", async () => {
    const client = clientReturning([{ value: 10_003n }, { value: 10_002n }]);

    await expect(repository.nextMany(client, 2)).resolves.toEqual(['ST-10002', 'ST-10003']);
  });

  it("nextMany: 0 ta — bazaga so'rovsiz, yetishmasa — xato", async () => {
    const client = clientReturning([]);

    await expect(repository.nextMany(client, 0)).resolves.toEqual([]);
    expect(client.$queryRaw).not.toHaveBeenCalled();
    await expect(repository.nextMany(client, 2)).rejects.toThrow(/student_code_seq/);
  });
});
