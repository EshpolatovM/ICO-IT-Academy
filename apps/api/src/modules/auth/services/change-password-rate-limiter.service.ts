import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';
import { CHANGE_PASSWORD_ATTEMPTS_KEY_PREFIX } from '../auth.constants.js';

import type { RateLimitPolicy } from '../../../common/rate-limit/rate-limit.types.js';

/**
 * `POST /auth/change-password` rate limit: foydalanuvchi id bo'yicha eski parol urinishlari
 * (`CHANGE_PASSWORD_RATE_LIMIT_*`, env). O'g'irlangan access token bilan eski parolni terib
 * topishga (va Argon2 CPU yukiga) qarshi. Urinish tekshiruvdan oldin sanaladi, muvaffaqiyatda tozalanadi.
 */
@Injectable()
export class ChangePasswordRateLimiter {
  private readonly policy: RateLimitPolicy;

  constructor(
    private readonly limiter: FixedWindowRateLimiter,
    config: AppConfigService,
  ) {
    this.policy = {
      keyPrefix: CHANGE_PASSWORD_ATTEMPTS_KEY_PREFIX,
      maxHits: config.get('CHANGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS'),
      windowSeconds: config.get('CHANGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS'),
    };
  }

  /** Limitdan oshgan bo'lsa — 429 (to'g'ri eski parol bilan ham). */
  consume(userId: string): Promise<void> {
    return this.limiter.consume(this.policy, userId);
  }

  succeed(userId: string): Promise<void> {
    return this.limiter.reset(this.policy, userId);
  }
}
