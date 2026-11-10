import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';
import { UNKNOWN_IP } from '../../../common/rate-limit/rate-limit.types.js';
import { LOGIN_FAILURE_KEY_PREFIX } from '../auth.constants.js';

import type { RateLimitPolicy } from '../../../common/rate-limit/rate-limit.types.js';

export type LoginKind = 'staff' | 'student';

export interface LoginAttemptKey {
  kind: LoginKind;
  ip: string | null;
  login: string;
}

/**
 * Login rate limit (docs/02 §6): `ip + login` bo'yicha muvaffaqiyatsiz urinishlar soni Redis'da,
 * oyna — birinchi xatodan boshlab. Limitga yetgach keyingi urinish — 429 (to'g'ri parol bilan ham).
 * Muvaffaqiyatli kirishda hisoblagich tozalanadi. Raqamlar — env'dan. Hisoblash —
 * umumiy `FixedWindowRateLimiter` orqali.
 */
@Injectable()
export class LoginRateLimiter {
  private readonly policy: RateLimitPolicy;

  constructor(
    private readonly limiter: FixedWindowRateLimiter,
    config: AppConfigService,
  ) {
    this.policy = {
      keyPrefix: LOGIN_FAILURE_KEY_PREFIX,
      maxHits: config.get('LOGIN_RATE_LIMIT_MAX_ATTEMPTS'),
      windowSeconds: config.get('LOGIN_RATE_LIMIT_WINDOW_SECONDS'),
    };
  }

  assertAllowed(attempt: LoginAttemptKey): Promise<void> {
    return this.limiter.assertAllowed(this.policy, this.subject(attempt));
  }

  async registerFailure(attempt: LoginAttemptKey): Promise<void> {
    await this.limiter.hit(this.policy, this.subject(attempt));
  }

  reset(attempt: LoginAttemptKey): Promise<void> {
    return this.limiter.reset(this.policy, this.subject(attempt));
  }

  private subject({ kind, ip, login }: LoginAttemptKey): string {
    return `${kind}:${ip ?? UNKNOWN_IP}:${login.toLowerCase()}`;
  }
}
