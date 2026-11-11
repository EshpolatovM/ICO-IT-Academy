import { Logger } from '@nestjs/common';

import { MentorScopeCache } from './mentor-scope-cache.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';

const KEY = 'mentor:m1:studentIds';
const GEN_KEY = 'mentor:m1:gen';
const GEN_TTL = 86_400;
const ATTEMPTS = 3;

function setup() {
  const redis = {
    isSetMember: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue('7'),
    replaceSetIfVersion: jest.fn().mockResolvedValue(true),
    bumpVersionsAndDelete: jest.fn().mockResolvedValue(undefined),
  };
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  return { redis, warn, error, cache: new MentorScopeCache(redis as unknown as RedisService) };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MentorScopeCache', () => {
  it("has: `mentor:{id}:studentIds` set'idan o'qiydi; xato bo'lsa — null (bazaga tushadi)", async () => {
    const { redis, cache } = setup();

    await expect(cache.has('m1', 's1')).resolves.toBe(true);
    expect(redis.isSetMember).toHaveBeenCalledWith(KEY, 's1');

    redis.isSetMember.mockRejectedValueOnce(new Error('redis down'));
    await expect(cache.has('m1', 's1')).resolves.toBeNull();
  });

  it("generation: `mentor:{id}:gen` qiymati, kalit yo'q — '', Redis xatosi — null", async () => {
    const { redis, cache } = setup();

    await expect(cache.generation('m1')).resolves.toBe('7');
    expect(redis.get).toHaveBeenCalledWith(GEN_KEY);

    redis.get.mockResolvedValueOnce(null);
    await expect(cache.generation('m1')).resolves.toBe('');

    redis.get.mockRejectedValueOnce(new Error('redis down'));
    await expect(cache.generation('m1')).resolves.toBeNull();
  });

  it("store: generatsiya sharti bilan, bo'sh belgi, TTL 60 s; xato so'rovni yiqitmaydi", async () => {
    const { redis, cache } = setup();

    await cache.store('m1', ['s1', 's2'], '7');
    expect(redis.replaceSetIfVersion).toHaveBeenCalledWith({
      key: KEY,
      versionKey: GEN_KEY,
      expectedVersion: '7',
      members: ['-', 's1', 's2'],
      ttlSeconds: 60,
    });

    redis.replaceSetIfVersion.mockRejectedValueOnce(new Error('redis down'));
    await expect(cache.store('m1', [], '')).resolves.toBeUndefined();
  });

  it("Redis ishlamasa log bir marta yoziladi (har so'rovda emas), tiklangach yana yoziladi", async () => {
    const { redis, cache, warn } = setup();
    redis.isSetMember.mockRejectedValue(new Error('redis down'));

    await cache.has('m1', 's1');
    await cache.has('m1', 's2');
    await cache.generation('m1');
    expect(warn).toHaveBeenCalledTimes(1);

    redis.isSetMember.mockResolvedValue(false);
    await cache.has('m1', 's1');
    redis.isSetMember.mockRejectedValue(new Error('redis down'));
    await cache.has('m1', 's1');
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('invalidate: barcha mentorlar bitta chaqiruvda (gen + set), null va takrorlar tashlanadi', async () => {
    const { redis, cache } = setup();

    await cache.invalidate('m1', null, 'm2', 'm1');
    expect(redis.bumpVersionsAndDelete).toHaveBeenCalledTimes(1);
    expect(redis.bumpVersionsAndDelete).toHaveBeenCalledWith(
      [
        { versionKey: GEN_KEY, dataKey: KEY },
        { versionKey: 'mentor:m2:gen', dataKey: 'mentor:m2:studentIds' },
      ],
      GEN_TTL,
    );

    redis.bumpVersionsAndDelete.mockClear();
    await cache.invalidate(null);
    expect(redis.bumpVersionsAndDelete).not.toHaveBeenCalled();
  });

  it('invalidate: vaqtinchalik xatoda qayta urinadi', async () => {
    const { redis, cache, error } = setup();
    redis.bumpVersionsAndDelete.mockRejectedValueOnce(new Error('blip'));

    await expect(cache.invalidate('m1')).resolves.toBeUndefined();
    expect(redis.bumpVersionsAndDelete).toHaveBeenCalledTimes(2);
    expect(error).not.toHaveBeenCalled();
  });

  it('invalidate: urinishlar tugasa xato TASHLAMAYDI, error log mentorId bilan (B1)', async () => {
    const { redis, cache, error } = setup();
    redis.bumpVersionsAndDelete.mockRejectedValue(new Error('redis down'));

    await expect(cache.invalidate('m1', 'm2')).resolves.toBeUndefined();
    expect(redis.bumpVersionsAndDelete).toHaveBeenCalledTimes(ATTEMPTS);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('m1, m2'));
  });
});
