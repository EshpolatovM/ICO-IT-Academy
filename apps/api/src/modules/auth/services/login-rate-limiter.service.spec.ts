import { ErrorCode } from '@lms/shared';

import { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';

import { LoginRateLimiter } from './login-rate-limiter.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { RedisService } from '../../../infra/redis/redis.service.js';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 900;
const IP_MAX_ATTEMPTS = 50;
const IP_WINDOW_SECONDS = 600;

function createLimiter(hits: Record<string, number> = {}) {
  const redis = {
    incrementWithTtl: jest.fn((key: string) => Promise.resolve(hits[key] ?? 1)),
    del: jest.fn().mockResolvedValue(1),
    decrementIfPositive: jest.fn().mockResolvedValue(0),
  };
  const settings: Record<string, number> = {
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: MAX_ATTEMPTS,
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: WINDOW_SECONDS,
    LOGIN_IP_RATE_LIMIT_MAX_ATTEMPTS: IP_MAX_ATTEMPTS,
    LOGIN_IP_RATE_LIMIT_WINDOW_SECONDS: IP_WINDOW_SECONDS,
  };
  const config = { get: (key: string) => settings[key] } as unknown as AppConfigService;
  const limiter = new LoginRateLimiter(
    new FixedWindowRateLimiter(redis as unknown as RedisService),
    config,
  );
  return { redis, limiter };
}

const attempt = { kind: 'student', ip: '10.0.0.1', login: 'ST-10001' } as const;
const LOGIN_KEY = 'auth:login:student:10.0.0.1:st-10001';
const IP_KEY = 'auth:login-ip:10.0.0.1';

describe('LoginRateLimiter', () => {
  it("urinish avval IP, keyin ip+login bo'yicha sanaladi (oyna muddatlari env'dan)", async () => {
    const { redis, limiter } = createLimiter();

    await expect(limiter.consume(attempt)).resolves.toBeUndefined();
    expect(redis.incrementWithTtl).toHaveBeenNthCalledWith(1, IP_KEY, IP_WINDOW_SECONDS);
    expect(redis.incrementWithTtl).toHaveBeenNthCalledWith(2, LOGIN_KEY, WINDOW_SECONDS);
  });

  it('ip+login limitidan oshgan — 429', async () => {
    const { limiter } = createLimiter({ [LOGIN_KEY]: MAX_ATTEMPTS + 1 });

    await expect(limiter.consume(attempt)).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMITED,
      status: 429,
    });
  });

  it('IP umumiy limitidan oshgan — 429, ip+login hisoblanmaydi', async () => {
    const { redis, limiter } = createLimiter({ [IP_KEY]: IP_MAX_ATTEMPTS + 1 });

    await expect(limiter.consume(attempt)).rejects.toMatchObject({ code: ErrorCode.RATE_LIMITED });
    expect(redis.incrementWithTtl).toHaveBeenCalledTimes(1);
  });

  it("muvaffaqiyat — ip+login tozalanadi, IP'dan urinish qaytariladi; IP yo'q bo'lsa 'unknown'", async () => {
    const { redis, limiter } = createLimiter();

    await limiter.succeed({ ...attempt, ip: null });

    expect(redis.del).toHaveBeenCalledWith('auth:login:student:unknown:st-10001');
    expect(redis.decrementIfPositive).toHaveBeenCalledWith('auth:login-ip:unknown');
  });
});
