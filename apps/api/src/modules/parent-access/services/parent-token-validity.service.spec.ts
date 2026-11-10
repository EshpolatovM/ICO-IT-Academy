import { Logger } from '@nestjs/common';

import { PARENT_TOKEN_VALID_CACHE_TTL_SECONDS } from '../parent-access.constants.js';

import { ParentTokenValidityCache } from './parent-token-validity.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';

const KEY = 'parent_token:t1:valid';

function createCache() {
  const redis = {
    get: jest.fn().mockResolvedValue('s1'),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };
  return { redis, cache: new ParentTokenValidityCache(redis as unknown as RedisService) };
}

describe('ParentTokenValidityCache', () => {
  let loggerWarn: jest.SpyInstance;

  beforeEach(() => {
    loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
  });

  afterEach(() => {
    loggerWarn.mockRestore();
  });

  it('read — parent_token:{id}:valid kalitidan student id', async () => {
    const { redis, cache } = createCache();

    expect(await cache.read('t1')).toBe('s1');
    expect(redis.get).toHaveBeenCalledWith(KEY);
  });

  it('remember — student id TTL bilan yoziladi', async () => {
    const { redis, cache } = createCache();

    await cache.remember('t1', 's1');

    expect(redis.set).toHaveBeenCalledWith(KEY, 's1', PARENT_TOKEN_VALID_CACHE_TTL_SECONDS);
  });

  it('Redis ishlamasa — read null qaytaradi, remember yiqilmaydi (baza — haqiqat manbai)', async () => {
    const { redis, cache } = createCache();
    redis.get.mockRejectedValue(new Error('ECONNREFUSED'));
    redis.set.mockRejectedValue(new Error('ECONNREFUSED'));

    expect(await cache.read('t1')).toBeNull();
    await expect(cache.remember('t1', 's1')).resolves.toBeUndefined();
    expect(loggerWarn).toHaveBeenCalledTimes(2);
  });

  it("invalidate — kalit o'chiriladi; xato yuqoriga uzatiladi (kesh eskirib qolmasin)", async () => {
    const { redis, cache } = createCache();

    await cache.invalidate('t1');
    expect(redis.del).toHaveBeenCalledWith(KEY);

    redis.del.mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(cache.invalidate('t1')).rejects.toThrow('ECONNREFUSED');
  });
});
