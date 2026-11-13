import { ContentStatus } from '@lms/shared';

import { PathPublishRepository } from './path-publish.repository.js';

import type { PrismaService } from '../../../infra/prisma/prisma.service.js';

function setup() {
  const updateMany = (count: number) => jest.fn().mockResolvedValue({ count });
  const client = {
    pathSection: { updateMany: updateMany(1) },
    topic: { updateMany: updateMany(2) },
    lesson: { updateMany: updateMany(3) },
  };
  const repository = new PathPublishRepository({ client } as unknown as PrismaService);
  return { repository, client };
}

const PUBLISH = { status: ContentStatus.PUBLISHED };
const NOT_ARCHIVED = { not: ContentStatus.ARCHIVED };

/** Kaskad faqat `ARCHIVED` bo'lmagan ota orqali (Domla 🟡-5) — `where` shartlari. */
describe('PathPublishRepository.publishDrafts', () => {
  it('har daraja bitta UPDATE: faqat DRAFT, ARCHIVED ota ichidagilari tegilmaydi; sonlar qaytadi', async () => {
    const { repository, client } = setup();

    await expect(repository.publishDrafts('p1')).resolves.toEqual({
      sections: 1,
      topics: 2,
      lessons: 3,
    });
    expect(client.pathSection.updateMany).toHaveBeenCalledWith({
      where: { status: ContentStatus.DRAFT, pathId: 'p1' },
      data: PUBLISH,
    });
    expect(client.topic.updateMany).toHaveBeenCalledWith({
      where: { status: ContentStatus.DRAFT, section: { pathId: 'p1', status: NOT_ARCHIVED } },
      data: PUBLISH,
    });
    expect(client.lesson.updateMany).toHaveBeenCalledWith({
      where: {
        status: ContentStatus.DRAFT,
        topic: { status: NOT_ARCHIVED, section: { pathId: 'p1', status: NOT_ARCHIVED } },
      },
      data: PUBLISH,
    });
  });
});
