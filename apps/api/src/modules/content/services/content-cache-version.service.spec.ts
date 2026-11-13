import { Logger } from '@nestjs/common';

import { ContentCacheVersion, contentVersionKey } from './content-cache-version.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';

function setup() {
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  const redis = {
    increment: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue('4'),
  };
  return {
    redis,
    warn,
    error,
    version: new ContentCacheVersion(redis as unknown as RedisService),
  };
}

describe('ContentCacheVersion', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('kalit: content:path:{id}:ver', () => {
    expect(contentVersionKey('p1')).toBe('content:path:p1:ver');
  });

  it("bump: takrorsiz yo'llar INCR qilinadi; bo'sh ro'yxat — Redis'ga murojaat yo'q", async () => {
    const { redis, version } = setup();

    await version.bump([]);
    expect(redis.increment).not.toHaveBeenCalled();

    await version.bump(['p1', 'p1', 'p2']);
    expect(redis.increment.mock.calls).toEqual([['content:path:p1:ver'], ['content:path:p2:ver']]);
  });

  it('Redis xatosi tashlanmaydi: qayta urinadi, oxirida error log', async () => {
    const { redis, version, error } = setup();
    redis.increment.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(version.bump(['p1'])).resolves.toBeUndefined();
    expect(redis.increment).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('p1'));
  });

  it("current: qiymat yoki '0'; Redis ishlamasa — null", async () => {
    const { redis, version, warn } = setup();

    await expect(version.current('p1')).resolves.toBe('4');
    redis.get.mockResolvedValueOnce(null);
    await expect(version.current('p1')).resolves.toBe('0');
    redis.get.mockRejectedValueOnce(new Error('down'));
    await expect(version.current('p1')).resolves.toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
