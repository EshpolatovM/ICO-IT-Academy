import { ErrorCode } from '@lms/shared';

import { pathRecord } from '../testing/content.fixtures.js';

import { PathDetailsService } from './path-details.service.js';
import { PathTreeService } from './path-tree.service.js';

import type { LearningPathsRepository } from '../repositories/learning-paths.repository.js';
import type { PathTreeRepository } from '../repositories/path-tree.repository.js';

function setup(found = true) {
  const paths = { findRecord: jest.fn().mockResolvedValue(found ? pathRecord() : null) };
  const nodes = {
    findSections: jest.fn().mockResolvedValue(found ? [{ id: 's1' }] : null),
    findSection: jest.fn().mockResolvedValue(null),
    findTopic: jest.fn().mockResolvedValue({ id: 't1' }),
  };
  const details = new PathDetailsService(paths as unknown as LearningPathsRepository);
  return new PathTreeService(nodes as unknown as PathTreeRepository, details);
}

describe('PathTreeService', () => {
  it("daraxt: yo'l tafsiloti (ISO vaqtlar) va bo'limlar", async () => {
    await expect(setup().tree('p1')).resolves.toEqual({
      path: {
        id: 'p1',
        title: 'Frontend',
        slug: 'frontend',
        description: null,
        status: 'DRAFT',
        createdAt: '2026-11-13T08:00:00.000Z',
        updatedAt: '2026-11-13T09:00:00.000Z',
        groupsCount: 0,
      },
      sections: [{ id: 's1' }],
    });
  });

  it("yo'l, bo'lim yoki mavzu yo'q — 404", async () => {
    const notFound = { code: ErrorCode.NOT_FOUND };

    await expect(setup(false).tree('p1')).rejects.toMatchObject(notFound);
    await expect(setup().section('s1')).rejects.toMatchObject(notFound);
    await expect(setup().topic('t1')).resolves.toEqual({ id: 't1' });
  });
});
