import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';
import { UNKNOWN_IP } from '../../../common/rate-limit/rate-limit.types.js';
import {
  PARENT_EXCHANGE_ATTEMPTS_KEY_PREFIX,
  PARENT_EXCHANGE_FAILURES_KEY_PREFIX,
} from '../auth.constants.js';

import type { RateLimitPolicy } from '../../../common/rate-limit/rate-limit.types.js';

/**
 * `POST /auth/parent/exchange` rate limit (docs/02 §5), IP bo'yicha:
 * - barcha urinishlar: `PARENT_EXCHANGE_MAX_ATTEMPTS` / `PARENT_EXCHANGE_WINDOW_SECONDS` (10 / 15 daqiqa);
 * - muvaffaqiyatsizlar: `PARENT_EXCHANGE_MAX_FAILURES` (20) ga yetsa IP `PARENT_EXCHANGE_BLOCK_SECONDS`
 *   (1 soat) ga bloklanadi; ular ham shu muddatli oynada sanaladi.
 */
@Injectable()
export class ParentExchangeRateLimiter {
  private readonly attempts: RateLimitPolicy;
  private readonly failures: RateLimitPolicy;

  constructor(
    private readonly limiter: FixedWindowRateLimiter,
    config: AppConfigService,
  ) {
    const blockSeconds = config.get('PARENT_EXCHANGE_BLOCK_SECONDS');
    this.attempts = {
      keyPrefix: PARENT_EXCHANGE_ATTEMPTS_KEY_PREFIX,
      maxHits: config.get('PARENT_EXCHANGE_MAX_ATTEMPTS'),
      windowSeconds: config.get('PARENT_EXCHANGE_WINDOW_SECONDS'),
    };
    this.failures = {
      keyPrefix: PARENT_EXCHANGE_FAILURES_KEY_PREFIX,
      maxHits: config.get('PARENT_EXCHANGE_MAX_FAILURES'),
      windowSeconds: blockSeconds,
      blockSeconds,
    };
  }

  /** Blok yoki urinishlar limiti — 429; aks holda urinish hisobga olinadi. */
  async consumeAttempt(ip: string | null): Promise<void> {
    const subject = ip ?? UNKNOWN_IP;
    await this.limiter.assertAllowed(this.failures, subject);
    await this.limiter.assertAllowed(this.attempts, subject);
    await this.limiter.hit(this.attempts, subject);
  }

  async registerFailure(ip: string | null): Promise<void> {
    await this.limiter.hit(this.failures, ip ?? UNKNOWN_IP);
  }
}
