import { ConcurrentModificationError } from '../../../common/exceptions/concurrent-modification.error.js';

import { TopicsRepository } from './topics.repository.js';

import type { PrismaService } from '../../../infra/prisma/prisma.service.js';

function setup(updated: number) {
  const client = { $executeRaw: jest.fn().mockResolvedValue(updated) };
  return new TopicsRepository({ client } as unknown as PrismaService);
}

/** Bitta statementli qayta tartiblash: qatorlar soni mos kelmasa — domen xatosi (Domla 🟡-1). */
describe('OrderedContentRepository.reorder', () => {
  it("barcha qatorlar yangilandi — xato yo'q", async () => {
    await expect(setup(2).reorder('s1', ['t1', 't2'])).resolves.toBeUndefined();
  });

  it("parallel o'chirish (kamroq qator) — ConcurrentModificationError", async () => {
    await expect(setup(1).reorder('s1', ['t1', 't2'])).rejects.toBeInstanceOf(
      ConcurrentModificationError,
    );
  });
});
