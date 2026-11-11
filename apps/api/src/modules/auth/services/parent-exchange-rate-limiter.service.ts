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
 * Server o'zi bergan (AES-GCM bilan autentifikatsiyalangan) `parent_tokens` cookie bilan muvaffaqiyatli
 * body'siz exchange sanalmaydi (docs/02 §5.1: sessiya yangilash; CGNAT ortidagi ota-onalar bir-birini
 * bloklamasin) — `ParentExchangeService` ga qarang.
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

  /**
   * Token tekshiruvidan OLDIN: IP bloklangan bo'lsa — 429; so'ng urinish atomar sanaladi va limitdan
   * oshgan bo'lsa — 429 (parallel so'rovlar limitni chetlab o'ta olmaydi).
   */
  async consumeAttempt(ip: string | null): Promise<void> {
    const subject = ip ?? UNKNOWN_IP;
    await this.limiter.assertAllowed(this.failures, subject);
    await this.limiter.consume(this.attempts, subject);
  }

  async registerFailure(ip: string | null): Promise<void> {
    await this.limiter.hit(this.failures, ip ?? UNKNOWN_IP);
  }

  /**
   * Oldindan sanalmagan (server bergan cookie bilan) urinish muvaffaqiyatsiz bo'lsa: urinish ham,
   * muvaffaqiyatsizlik ham hisobga olinadi (429 tashlanmaydi — javob baribir 401).
   */
  async registerFailedAttempt(ip: string | null): Promise<void> {
    const subject = ip ?? UNKNOWN_IP;
    await this.limiter.hit(this.attempts, subject);
    await this.limiter.hit(this.failures, subject);
  }
}
