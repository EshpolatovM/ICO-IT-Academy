import { SkillsRepository } from './skills.repository.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';
import type { PrismaService } from '../../../infra/prisma/prisma.service.js';

const SKILL_ROW = { id: 'k1', name: 'HTML', icon: null, _count: { topics: 0 } };

function setup(lockedRows: { id: string }[]) {
  const client = {
    $queryRaw: jest.fn().mockResolvedValue(lockedRows),
    skill: { findUnique: jest.fn().mockResolvedValue(SKILL_ROW) },
  };
  const repository = new SkillsRepository({ client } as unknown as PrismaService);
  return { repository, client };
}

/** Umumiy `lockRecord` (Domla 🟢-1): merosxo'r jadvali `FOR UPDATE`, keyin `findRecord`. */
describe('ContentRepository.lockRecord', () => {
  it("merosxo'r jadvalini qulflaydi va yozuvni o'qiydi", async () => {
    const { repository, client } = setup([{ id: 'k1' }]);

    await expect(repository.lockRecord('k1')).resolves.toEqual({
      id: 'k1',
      name: 'HTML',
      icon: null,
      topicsCount: 0,
    });
    const [strings, table, id] = client.$queryRaw.mock.calls[0] as [
      TemplateStringsArray,
      Prisma.Sql,
      string,
    ];
    expect(strings.join('?')).toContain('FOR UPDATE');
    expect(table.sql).toBe('"skills"');
    expect(id).toBe('k1');
  });

  it("qator yo'q — null, o'qish yo'q", async () => {
    const { repository, client } = setup([]);

    await expect(repository.lockRecord('k1')).resolves.toBeNull();
    expect(client.skill.findUnique).not.toHaveBeenCalled();
  });
});
