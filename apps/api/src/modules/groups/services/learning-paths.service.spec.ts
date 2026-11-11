import { ContentStatus } from '@lms/shared';

import { LearningPathsService } from './learning-paths.service.js';

import type { LearningPathRecord } from '../groups.types.js';
import type { LearningPathsRepository } from '../repositories/learning-paths.repository.js';

function setup(records: LearningPathRecord[]) {
  const paths = { listRefs: jest.fn().mockResolvedValue(records) };
  const service = new LearningPathsService(paths as unknown as LearningPathsRepository);
  return { service, paths };
}

const BACKEND: LearningPathRecord = {
  id: 'p1',
  title: 'Backend',
  slug: 'backend',
  status: ContentStatus.PUBLISHED,
};
const FRONTEND: LearningPathRecord = {
  id: 'p2',
  title: 'Frontend',
  slug: 'frontend',
  status: ContentStatus.DRAFT,
};

describe('LearningPathsService', () => {
  it("yozuvlar `items` ga repository tartibida, faqat ro'yxat maydonlari bilan o'tadi", async () => {
    const withExtraField = { ...BACKEND, createdAt: new Date(0) };
    const { service, paths } = setup([withExtraField, FRONTEND]);

    const result = await service.list();

    expect(paths.listRefs).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({ items: [BACKEND, FRONTEND] });
  });

  it("yo'l yo'q — bo'sh ro'yxat", async () => {
    const { service } = setup([]);

    await expect(service.list()).resolves.toStrictEqual({ items: [] });
  });
});
