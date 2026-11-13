import { ContentStatus } from '@lms/shared';

import { LearningPathsRepository } from './learning-paths.repository.js';

import type { PrismaService } from '../../../infra/prisma/prisma.service.js';

function setup(found: { id: string } | null) {
  const learningPath = { findFirst: jest.fn().mockResolvedValue(found) };
  const repository = new LearningPathsRepository({
    client: { learningPath },
  } as unknown as PrismaService);
  return { repository, learningPath };
}

describe('LearningPathsRepository.isAssignable (R Q-6)', () => {
  it("faqat DRAFT/PUBLISHED yo'l guruhga biriktiriladi (ARCHIVED yoki yo'q — false)", async () => {
    const { repository, learningPath } = setup({ id: 'p1' });

    await expect(repository.isAssignable('p1')).resolves.toBe(true);
    expect(learningPath.findFirst).toHaveBeenCalledWith({
      where: { id: 'p1', status: { in: [ContentStatus.DRAFT, ContentStatus.PUBLISHED] } },
      select: { id: true },
    });
    await expect(setup(null).repository.isAssignable('p1')).resolves.toBe(false);
  });
});
