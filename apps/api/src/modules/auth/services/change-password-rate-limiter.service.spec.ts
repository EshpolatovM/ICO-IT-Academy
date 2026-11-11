import { ChangePasswordRateLimiter } from './change-password-rate-limiter.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';

const SETTINGS: Record<string, number> = {
  CHANGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS: 5,
  CHANGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS: 900,
};
const policy = { keyPrefix: 'auth:change-password:', maxHits: 5, windowSeconds: 900 };

describe('ChangePasswordRateLimiter', () => {
  it("foydalanuvchi id bo'yicha sanaydi va muvaffaqiyatda tozalaydi (raqamlar env'dan)", async () => {
    const limiter = {
      consume: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };
    const config = { get: (key: string) => SETTINGS[key] } as unknown as AppConfigService;
    const service = new ChangePasswordRateLimiter(
      limiter as unknown as FixedWindowRateLimiter,
      config,
    );

    await service.consume('u1');
    await service.succeed('u1');

    expect(limiter.consume).toHaveBeenCalledWith(policy, 'u1');
    expect(limiter.reset).toHaveBeenCalledWith(policy, 'u1');
  });
});
