import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { RedisService } from '../../infra/redis/redis.service.js';
import { AppException } from '../exceptions/app.exception.js';

import type { RateLimitPolicy } from './rate-limit.types.js';

/**
 * Umumiy fixed-window rate limiter (Redis hisoblagichi). Oyna — birinchi urinishdan boshlab.
 * Hisoblagich `maxHits` ga yetgach `assertAllowed` 429 beradi; policy'da `blockSeconds` bo'lsa,
 * limitga yetgan paytdan boshlab kalit shu muddatga uzaytiriladi (blok).
 * Login (docs/02 §6) va ota-ona exchange (docs/02 §5) shu class'dan foydalanadi.
 */
@Injectable()
export class FixedWindowRateLimiter {
  constructor(private readonly redis: RedisService) {}

  async assertAllowed(policy: RateLimitPolicy, subject: string): Promise<void> {
    const hits = Number(await this.redis.get(this.key(policy, subject)));
    if (hits >= policy.maxHits) {
      throw new AppException({ code: ErrorCode.RATE_LIMITED });
    }
  }

  async hit(policy: RateLimitPolicy, subject: string): Promise<number> {
    const key = this.key(policy, subject);
    const hits = await this.redis.incrementWithTtl(key, policy.windowSeconds);
    if (policy.blockSeconds !== undefined && hits >= policy.maxHits) {
      await this.redis.expire(key, policy.blockSeconds);
    }
    return hits;
  }

  async reset(policy: RateLimitPolicy, subject: string): Promise<void> {
    await this.redis.del(this.key(policy, subject));
  }

  private key(policy: RateLimitPolicy, subject: string): string {
    return `${policy.keyPrefix}${subject}`;
  }
}
