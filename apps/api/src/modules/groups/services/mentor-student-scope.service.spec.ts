import { CachedMentorStudentScope } from './mentor-student-scope.service.js';

import type { MentorScopeCache } from './mentor-scope-cache.service.js';
import type { MentorScopeRepository } from '../repositories/mentor-scope.repository.js';

function setup(cached: boolean | null, generation: string | null = '3') {
  const calls: string[] = [];
  const cache = {
    has: jest.fn().mockResolvedValue(cached),
    generation: jest.fn(() => {
      calls.push('generation');
      return Promise.resolve(generation);
    }),
    store: jest.fn().mockResolvedValue(undefined),
  };
  const repository = {
    findStudentIds: jest.fn(() => {
      calls.push('db');
      return Promise.resolve(['s1', 's2']);
    }),
  };
  const scope = new CachedMentorStudentScope(
    cache as unknown as MentorScopeCache,
    repository as unknown as MentorScopeRepository,
  );
  return { scope, cache, repository, calls };
}

describe('CachedMentorStudentScope', () => {
  it.each([true, false])("kesh hit (%s) — bazaga murojaat yo'q", async (cached) => {
    const { scope, repository } = setup(cached);

    await expect(scope.isMentorOf('m1', 's1')).resolves.toBe(cached);
    expect(repository.findStudentIds).not.toHaveBeenCalled();
  });

  it("kesh miss — generatsiya DB'dan OLDIN olinadi, to'plam shu generatsiya bilan yoziladi", async () => {
    const { scope, cache, repository, calls } = setup(null);

    await expect(scope.isMentorOf('m1', 's2')).resolves.toBe(true);
    await expect(scope.isMentorOf('m1', 's9')).resolves.toBe(false);
    expect(repository.findStudentIds).toHaveBeenCalledWith('m1');
    expect(calls.slice(0, 2)).toEqual(['generation', 'db']);
    expect(cache.store).toHaveBeenCalledWith('m1', ['s1', 's2'], '3');
  });

  it('Redis ishlamasa (generatsiya null) — bazadan javob, keshga yozilmaydi', async () => {
    const { scope, cache } = setup(null, null);

    await expect(scope.isMentorOf('m1', 's1')).resolves.toBe(true);
    expect(cache.store).not.toHaveBeenCalled();
  });

  it("bo'sh to'plam belgisi hech qachon student emas", async () => {
    const { scope, cache } = setup(true);

    await expect(scope.isMentorOf('m1', '-')).resolves.toBe(false);
    expect(cache.has).not.toHaveBeenCalled();
  });
});
