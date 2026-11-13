import { ForeignKeyViolationError } from '../../../common/exceptions/constraint-violation.error.js';
import { Prisma } from '../../../infra/prisma/generated/client.js';
import { PRISMA_FOREIGN_KEY_VIOLATION } from '../../../infra/prisma/prisma-error-codes.js';

import { TopicSkillsRepository } from './topic-skills.repository.js';

import type { PrismaService } from '../../../infra/prisma/prisma.service.js';

/** Poygada o'chirilgan ko'nikma (FK) — domen xatosi, servis 400 `skillIds` beradi (Domla 🟢-4). */
describe('TopicSkillsRepository.replace', () => {
  it('createMany FK xatosi — ForeignKeyViolationError', async () => {
    const fkError = new Prisma.PrismaClientKnownRequestError('fk', {
      code: PRISMA_FOREIGN_KEY_VIOLATION,
      clientVersion: '7.10.1',
    });
    const topicSkill = {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockRejectedValue(fkError),
    };
    const repository = new TopicSkillsRepository({
      client: { topicSkill },
    } as unknown as PrismaService);

    await expect(repository.replace('t1', ['k1'])).rejects.toBeInstanceOf(ForeignKeyViolationError);
    expect(topicSkill.createMany).toHaveBeenCalledWith({
      data: [{ topicId: 't1', skillId: 'k1' }],
    });
  });
});
