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
});
