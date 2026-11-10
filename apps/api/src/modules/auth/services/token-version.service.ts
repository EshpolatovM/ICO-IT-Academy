import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '../../../infra/redis/redis.service.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { TOKEN_VERSION_CACHE_PREFIX, TOKEN_VERSION_CACHE_TTL_SECONDS } from '../auth.constants.js';

function cacheKey(userId: string): string {
  return `${TOKEN_VERSION_CACHE_PREFIX}${userId}`;
}

/**
 * `users.token_version` — har so'rovda access token'dagi `ver` bilan solishtiriladi (docs/02 §3).
 * Redis keshi (docs/13 §6); kesh o'qilmasa — to'g'ridan-to'g'ri bazadan (so'rov yiqilmaydi).
 * Keshga yozish — "faqat kattaroq versiya" (Lua compare-and-set): bazadan eski versiyani o'qigan
 * parallel so'rov yangi versiya ustidan yoza olmaydi.
 * `token_version` ni o'zgartirgan har bir joy `onVersionChanged` ni chaqirishi shart.
 */
@Injectable()
export class TokenVersionService {
  private readonly logger = new Logger(TokenVersionService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly users: UsersRepository,
  ) {}

  /** Joriy versiya; foydalanuvchi topilmasa (o'chirilgan) — `null`. */
  async current(userId: string): Promise<number | null> {
    const cached = await this.readCache(userId);
    if (cached !== null) {
      return cached;
    }
    const version = await this.users.findTokenVersion(userId);
    if (version !== null) {
      await this.cacheFromRead(userId, version);
    }
    return version;
  }

  /**
   * Versiya oshgandan keyin (parol almashtirish/tiklash, deaktivatsiya). Kesh xatosi yutilmaydi:
   * yozib bo'lmasa kalit o'chiriladi (keyingi so'rov bazadan o'qiydi); u ham bo'lmasa — xato
   * yuqoriga uzatiladi (eski versiya keshda qolib, eski access tokenlar ishlamasin).
   */
  async onVersionChanged(userId: string, version: number): Promise<void> {
    try {
      await this.redis.setIfGreater(cacheKey(userId), version, TOKEN_VERSION_CACHE_TTL_SECONDS);
    } catch (error) {
      this.logger.warn(`token_version keshiga yozib bo'lmadi, kalit o'chiriladi: ${String(error)}`);
      await this.redis.del(cacheKey(userId));
    }
  }

  /** O'qishda keshlash — xato so'rovni yiqitmaydi. */
  private async cacheFromRead(userId: string, version: number): Promise<void> {
    try {
      await this.redis.setIfGreater(cacheKey(userId), version, TOKEN_VERSION_CACHE_TTL_SECONDS);
    } catch (error) {
      this.logger.warn(`token_version keshiga yozib bo'lmadi: ${String(error)}`);
    }
  }

  private async readCache(userId: string): Promise<number | null> {
    try {
      const raw = await this.redis.get(cacheKey(userId));
      const version = raw === null ? Number.NaN : Number(raw);
      return Number.isInteger(version) ? version : null;
    } catch (error) {
      this.logger.warn(`token_version keshini o'qib bo'lmadi: ${String(error)}`);
      return null;
    }
  }
}
