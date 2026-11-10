import { ErrorCode } from '@lms/shared';

import { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';

import { LoginRateLimiter } from './login-rate-limiter.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { RedisService } from '../../../infra/redis/redis.service.js';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 900;

function createLimiter(failures: string | null) {
  const redis = {
    get: jest.fn().mockResolvedValue(failures),
    incrementWithTtl: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
  };
  const settings: Record<string, number> = {
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: MAX_ATTEMPTS,
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: WINDOW_SECONDS,
  };
  const config = { get: (key: string) => settings[key] } as unknown as AppConfigService;
  const limiter = new LoginRateLimiter(
    new FixedWindowRateLimiter(redis as unknown as RedisService),
    config,
  );
  return { redis, limiter };
}

const attempt = { kind: 'student', ip: '10.0.0.1', login: 'ST-10001' } as const;
const KEY = 'auth:login-fail:student:10.0.0.1:st-10001';

describe('LoginRateLimiter', () => {
  it("limitdan kam bo'lsa o'tkazadi (kalit: tur + ip + login)", async () => {
    const { redis, limiter } = createLimiter('4');

    await expect(limiter.assertAllowed(attempt)).resolves.toBeUndefined();
    expect(redis.get).toHaveBeenCalledWith(KEY);
  });

  it("hisoblagich yo'q — o'tkazadi", async () => {
    const { limiter } = createLimiter(null);

    await expect(limiter.assertAllowed(attempt)).resolves.toBeUndefined();
  });

  it('limitga yetgan — 429 RATE_LIMITED', async () => {
    const { limiter } = createLimiter(String(MAX_ATTEMPTS));

    await expect(limiter.assertAllowed(attempt)).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMITED,
      status: 429,
    });
  });

  it("xato urinish oyna muddati bilan hisoblanadi, muvaffaqiyatda tozalanadi; IP yo'q bo'lsa 'unknown'", async () => {
    const { redis, limiter } = createLimiter(null);

    await limiter.registerFailure(attempt);
    await limiter.reset({ ...attempt, ip: null });

    expect(redis.incrementWithTtl).toHaveBeenCalledWith(KEY, WINDOW_SECONDS);
    expect(redis.del).toHaveBeenCalledWith('auth:login-fail:student:unknown:st-10001');
  });
});
