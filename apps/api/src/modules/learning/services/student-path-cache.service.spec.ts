import { Logger } from '@nestjs/common';

import { StudentPathCache, studentPathKey } from './student-path-cache.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';
import type { StudentPathCacheEnvelope } from '../learning.types.js';

const ENVELOPE: StudentPathCacheEnvelope = {
  pathId: 'p1',
  contentVersion: '2',
  map: {
    path: null,
    currentTopicId: null,
    reviewBlock: { blocked: false, dueCount: 0 },
    sections: [],
  },
};

function setup() {
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  const redis = {
    get: jest.fn().mockResolvedValue(null),
    setIfVersion: jest.fn().mockResolvedValue(true),
    bumpVersionsAndDelete: jest.fn().mockResolvedValue(undefined),
  };
  return { redis, error, cache: new StudentPathCache(redis as unknown as RedisService) };
}

describe('StudentPathCache', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('kalit: path:{studentId}; hit — konvert, miss — null', async () => {
    const { redis, cache } = setup();
    expect(studentPathKey('s1')).toBe('path:s1');

    await expect(cache.read('s1')).resolves.toBeNull();
    redis.get.mockResolvedValueOnce(JSON.stringify(ENVELOPE));
    await expect(cache.read('s1')).resolves.toEqual(ENVELOPE);
    expect(redis.get).toHaveBeenCalledWith('path:s1');
  });

  it("generation: '' (yo'q) yoki qiymat; store — faqat gen o'zgarmagan bo'lsa (setIfVersion)", async () => {
    const { redis, cache } = setup();

    await expect(cache.generation('s1')).resolves.toBe('');
    await cache.store('s1', ENVELOPE, '');
    expect(redis.setIfVersion).toHaveBeenCalledWith({
      key: 'path:s1',
      versionKey: 'path:s1:gen',
      expectedVersion: '',
      value: JSON.stringify(ENVELOPE),
      ttlSeconds: 600,
    });
  });

  it('Redis xatosi — null (DB dan hisoblanadi), store xato tashlamaydi', async () => {
    const { redis, cache } = setup();
    redis.get.mockRejectedValue(new Error('down'));
    redis.setIfVersion.mockRejectedValue(new Error('down'));

    await expect(cache.read('s1')).resolves.toBeNull();
    await expect(cache.generation('s1')).resolves.toBeNull();
    await expect(cache.store('s1', ENVELOPE, '1')).resolves.toBeUndefined();
  });

  it('invalidate: INCR gen + DEL; xato tashlamaydi — qayta urinish va error log', async () => {
    const { redis, cache, error } = setup();

    await cache.invalidate('s1');
    expect(redis.bumpVersionsAndDelete).toHaveBeenCalledWith(
      [{ versionKey: 'path:s1:gen', dataKey: 'path:s1' }],
      86_400,
    );
    redis.bumpVersionsAndDelete.mockRejectedValue(new Error('down'));
    await expect(cache.invalidate('s1')).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('s1'));
  });
});
