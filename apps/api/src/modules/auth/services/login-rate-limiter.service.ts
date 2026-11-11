import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';
import { UNKNOWN_IP } from '../../../common/rate-limit/rate-limit.types.js';
import { LOGIN_ATTEMPTS_KEY_PREFIX, LOGIN_IP_ATTEMPTS_KEY_PREFIX } from '../auth.constants.js';

import type { RateLimitPolicy } from '../../../common/rate-limit/rate-limit.types.js';

export type LoginKind = 'staff' | 'student';

export interface LoginAttemptKey {
  kind: LoginKind;
  ip: string | null;
  login: string;
}

/**
 * Login rate limit (docs/02 §6), raqamlar env'dan:
 * - `ip + login`: `LOGIN_RATE_LIMIT_*` (5 / 15 daqiqa);
 * - IP bo'yicha umumiy: `LOGIN_IP_RATE_LIMIT_*` (password spraying, Argon2 CPU DoS'ga qarshi).
 * Urinish parol tekshiruvidan OLDIN atomar sanaladi (`consume`) — parallel so'rovlar limitni
 * chetlab o'ta olmaydi. Muvaffaqiyatli kirishda `ip + login` tozalanadi, IP hisoblagichidan esa shu
 * urinish qaytariladi (umumiy limit amalda faqat muvaffaqiyatsizlarni sanaydi: bitta IP ortidagi
 * sinf/CGNAT foydalanuvchilari bir-birini bloklamaydi).
 */
@Injectable()
export class LoginRateLimiter {
  private readonly perLogin: RateLimitPolicy;
  private readonly perIp: RateLimitPolicy;

  constructor(
    private readonly limiter: FixedWindowRateLimiter,
    config: AppConfigService,
  ) {
    this.perLogin = {
      keyPrefix: LOGIN_ATTEMPTS_KEY_PREFIX,
      maxHits: config.get('LOGIN_RATE_LIMIT_MAX_ATTEMPTS'),
      windowSeconds: config.get('LOGIN_RATE_LIMIT_WINDOW_SECONDS'),
    };
    this.perIp = {
      keyPrefix: LOGIN_IP_ATTEMPTS_KEY_PREFIX,
      maxHits: config.get('LOGIN_IP_RATE_LIMIT_MAX_ATTEMPTS'),
      windowSeconds: config.get('LOGIN_IP_RATE_LIMIT_WINDOW_SECONDS'),
    };
  }

  /** Urinishni sanaydi; IP yoki `ip + login` limiti oshgan bo'lsa — 429 (to'g'ri parol bilan ham). */
  async consume(attempt: LoginAttemptKey): Promise<void> {
    await this.limiter.consume(this.perIp, this.ipSubject(attempt));
    await this.limiter.consume(this.perLogin, this.loginSubject(attempt));
  }

  /** Muvaffaqiyatli kirish. */
  async succeed(attempt: LoginAttemptKey): Promise<void> {
    await Promise.all([
      this.limiter.reset(this.perLogin, this.loginSubject(attempt)),
      this.limiter.release(this.perIp, this.ipSubject(attempt)),
    ]);
  }

  private ipSubject({ ip }: LoginAttemptKey): string {
    return ip ?? UNKNOWN_IP;
  }

  private loginSubject(attempt: LoginAttemptKey): string {
    return `${attempt.kind}:${this.ipSubject(attempt)}:${attempt.login.toLowerCase()}`;
  }
}
