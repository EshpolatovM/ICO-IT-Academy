import { ErrorCode } from '@lms/shared';

import { FixedWindowRateLimiter } from './fixed-window-rate-limiter.service.js';

import type { RateLimitPolicy } from './rate-limit.types.js';
import type { RedisService } from '../../infra/redis/redis.service.js';

function createLimiter(stored: string | null, hits = 1) {
  const redis = {
    get: jest.fn().mockResolvedValue(stored),
    incrementWithTtl: jest.fn().mockResolvedValue(hits),
    expire: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(1),
    decrementIfPositive: jest.fn().mockResolvedValue(0),
  };
  return { redis, limiter: new FixedWindowRateLimiter(redis as unknown as RedisService) };
}

const policy: RateLimitPolicy = { keyPrefix: 'rl:test:', maxHits: 3, windowSeconds: 60 };
const blocking: RateLimitPolicy = { ...policy, blockSeconds: 3600 };

describe('FixedWindowRateLimiter', () => {
  it("limitdan kam yoki hisoblagich yo'q — o'tkazadi", async () => {
    await expect(createLimiter('2').limiter.assertAllowed(policy, 'a')).resolves.toBeUndefined();
    await expect(createLimiter(null).limiter.assertAllowed(policy, 'a')).resolves.toBeUndefined();
  });

  it('limitga yetgan — 429 RATE_LIMITED', async () => {
    const { redis, limiter } = createLimiter('3');

    await expect(limiter.assertAllowed(policy, 'a')).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMITED,
      status: 429,
    });
    expect(redis.get).toHaveBeenCalledWith('rl:test:a');
  });

  it('hit — oyna muddati bilan hisoblaydi; blocksiz policy kalitni uzaytirmaydi', async () => {
    const { redis, limiter } = createLimiter(null, 5);

    await expect(limiter.hit(policy, 'a')).resolves.toBe(5);
    expect(redis.incrementWithTtl).toHaveBeenCalledWith('rl:test:a', 60);
    expect(redis.expire).not.toHaveBeenCalled();
  });

  it('blockSeconds — limitga yetganda kalit blok muddatiga uzaytiriladi', async () => {
    const below = createLimiter(null, 2);
    await below.limiter.hit(blocking, 'a');
    expect(below.redis.expire).not.toHaveBeenCalled();

    const reached = createLimiter(null, 3);
    await reached.limiter.hit(blocking, 'a');
    expect(reached.redis.expire).toHaveBeenCalledWith('rl:test:a', 3600);
  });

  it("reset — kalitni o'chiradi", async () => {
    const { redis, limiter } = createLimiter(null);

    await limiter.reset(policy, 'a');
    expect(redis.del).toHaveBeenCalledWith('rl:test:a');
  });

  it('consume — avval atomar sanaydi, limitdan oshganda 429', async () => {
    const within = createLimiter(null, 3);
    await expect(within.limiter.consume(policy, 'a')).resolves.toBeUndefined();
    expect(within.redis.incrementWithTtl).toHaveBeenCalledWith('rl:test:a', 60);
    expect(within.redis.get).not.toHaveBeenCalled();

    const over = createLimiter(null, 4);
    await expect(over.limiter.consume(policy, 'a')).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMITED,
      status: 429,
    });
  });

  it("release — hisoblagichni musbat bo'lsagina kamaytiradi", async () => {
    const { redis, limiter } = createLimiter(null);

    await limiter.release(policy, 'a');
    expect(redis.decrementIfPositive).toHaveBeenCalledWith('rl:test:a');
  });
});
