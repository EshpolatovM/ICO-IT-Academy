import { Logger } from '@nestjs/common';

import {
  PARENT_TOKEN_REVOKED_TOMBSTONE_TTL_SECONDS,
  PARENT_TOKEN_VALID_CACHE_TTL_SECONDS,
} from '../parent-access.constants.js';

import { ParentTokenValidityCache } from './parent-token-validity.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';

const VALID_KEY = 'parent_token:t1:valid';
const REVOKED_KEY = 'parent_token:t1:revoked';

function createCache(values: (string | null)[] = ['s1', null]) {
  const redis = {
    getMany: jest.fn().mockResolvedValue(values),
    set: jest.fn().mockResolvedValue(undefined),
    setUnlessExists: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(1),
  };
  return { redis, cache: new ParentTokenValidityCache(redis as unknown as RedisService) };
}

describe('ParentTokenValidityCache', () => {
  let loggerWarn: jest.SpyInstance;
  let loggerError: jest.SpyInstance;

  beforeEach(() => {
    loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    loggerError = jest.spyOn(Logger.prototype, 'error').mockReturnValue(undefined);
  });

  afterEach(() => {
    loggerWarn.mockRestore();
    loggerError.mockRestore();
  });

  it("':valid' va ':revoked' bitta MGET bilan o'qiladi — amaldagi student id", async () => {
    const { redis, cache } = createCache();

    expect(await cache.read('t1')).toEqual({ state: 'valid', studentId: 's1' });
    expect(redis.getMany).toHaveBeenCalledWith([VALID_KEY, REVOKED_KEY]);
  });

  it("tombstone bor — 'revoked' (valid keshi bo'lsa ham); hech narsa yo'q — 'unknown'", async () => {
    expect(await createCache(['s1', '1']).cache.read('t1')).toEqual({ state: 'revoked' });
    expect(await createCache([null, null]).cache.read('t1')).toEqual({ state: 'unknown' });
  });

  it("remember — tombstone bo'lmasagina TTL bilan atomar yoziladi", async () => {
    const { redis, cache } = createCache();

    await cache.remember('t1', 's1');

    expect(redis.setUnlessExists).toHaveBeenCalledWith(
      VALID_KEY,
      REVOKED_KEY,
      's1',
      PARENT_TOKEN_VALID_CACHE_TTL_SECONDS,
    );
  });

  it("Redis ishlamasa — read 'unknown', remember yiqilmaydi (baza — haqiqat manbai)", async () => {
    const { redis, cache } = createCache();
    redis.getMany.mockRejectedValue(new Error('ECONNREFUSED'));
    redis.setUnlessExists.mockRejectedValue(new Error('ECONNREFUSED'));

    expect(await cache.read('t1')).toEqual({ state: 'unknown' });
    await expect(cache.remember('t1', 's1')).resolves.toBeUndefined();
    expect(loggerWarn).toHaveBeenCalledTimes(2);
  });

  it("markRevoked — avval tombstone, so'ng :valid o'chiriladi", async () => {
    const { redis, cache } = createCache();

    await cache.markRevoked('t1');

    expect(redis.set).toHaveBeenCalledWith(
      REVOKED_KEY,
      '1',
      PARENT_TOKEN_REVOKED_TOMBSTONE_TTL_SECONDS,
    );
    expect(redis.del).toHaveBeenCalledWith(VALID_KEY);
    expect(redis.set.mock.invocationCallOrder[0]).toBeLessThan(
      redis.del.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('markRevoked — Redis xatosi yuqoriga uzatilmaydi (log), tombstone TTL >= valid TTL', async () => {
    const { redis, cache } = createCache();
    redis.set.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(cache.markRevoked('t1')).resolves.toBeUndefined();
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(PARENT_TOKEN_REVOKED_TOMBSTONE_TTL_SECONDS).toBeGreaterThanOrEqual(
      PARENT_TOKEN_VALID_CACHE_TTL_SECONDS,
    );
  });
});
