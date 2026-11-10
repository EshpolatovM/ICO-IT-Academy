import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import { RedisService } from '../../../infra/redis/redis.service.js';
import { LOGIN_FAILURE_KEY_PREFIX, UNKNOWN_IP } from '../auth.constants.js';

export type LoginKind = 'staff' | 'student';

export interface LoginAttemptKey {
  kind: LoginKind;
  ip: string | null;
  login: string;
}

/**
 * Login rate limit (docs/02 §6): `ip + login` bo'yicha muvaffaqiyatsiz urinishlar soni Redis'da,
 * oyna — birinchi xatodan boshlab. Limitga yetgach keyingi urinish — 429 (to'g'ri parol bilan ham).
 * Muvaffaqiyatli kirishda hisoblagich tozalanadi. Raqamlar — env'dan.
 */
@Injectable()
export class LoginRateLimiter {
  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  async assertAllowed(attempt: LoginAttemptKey): Promise<void> {
    const failures = Number(await this.redis.get(this.key(attempt)));
    if (failures >= this.config.get('LOGIN_RATE_LIMIT_MAX_ATTEMPTS')) {
      throw new AppException({ code: ErrorCode.RATE_LIMITED });
    }
  }

  async registerFailure(attempt: LoginAttemptKey): Promise<void> {
    await this.redis.incrementWithTtl(
      this.key(attempt),
      this.config.get('LOGIN_RATE_LIMIT_WINDOW_SECONDS'),
    );
  }

  async reset(attempt: LoginAttemptKey): Promise<void> {
    await this.redis.del(this.key(attempt));
  }

  private key({ kind, ip, login }: LoginAttemptKey): string {
    return `${LOGIN_FAILURE_KEY_PREFIX}${kind}:${ip ?? UNKNOWN_IP}:${login.toLowerCase()}`;
  }
}
