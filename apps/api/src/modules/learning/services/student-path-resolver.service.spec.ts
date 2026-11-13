import { StudentPathResolver } from './student-path-resolver.service.js';

import type { ContentCacheVersion } from '../../content/services/content-cache-version.service.js';
import type { StudentCurrentPathRepository } from '../repositories/student-current-path.repository.js';

function setup(pathId: string | null, version: string | null = '3') {
  const repository = { findPublishedPathId: jest.fn().mockResolvedValue(pathId) };
  const contentVersion = { current: jest.fn().mockResolvedValue(version) };
  const resolver = new StudentPathResolver(
    repository as unknown as StudentCurrentPathRepository,
    contentVersion as unknown as ContentCacheVersion,
  );
  return { resolver, repository, contentVersion };
}

describe('StudentPathResolver', () => {
  it("faol guruh yo'q yoki yo'l PUBLISHED emas (repository filtri) — null, versiya so'ralmaydi", async () => {
    const { resolver, contentVersion } = setup(null);

    await expect(resolver.resolve('s1')).resolves.toBeNull();
    expect(contentVersion.current).not.toHaveBeenCalled();
  });

  it("faol a'zolik (guruh ARCHIVED bo'lsa ham) — yo'l va kontent versiyasi", async () => {
    const { resolver, repository } = setup('p1');

    await expect(resolver.resolve('s1')).resolves.toEqual({ pathId: 'p1', contentVersion: '3' });
    expect(repository.findPublishedPathId).toHaveBeenCalledWith('s1');
  });

  it("Redis ishlamasa — contentVersion null (kesh chetlab o'tiladi)", async () => {
    const { resolver } = setup('p1', null);

    await expect(resolver.resolve('s1')).resolves.toEqual({ pathId: 'p1', contentVersion: null });
  });
});
