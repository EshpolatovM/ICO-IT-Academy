import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '../../../infra/redis/redis.service.js';
import {
  PARENT_TOKEN_VALID_CACHE_PREFIX,
  PARENT_TOKEN_VALID_CACHE_SUFFIX,
  PARENT_TOKEN_VALID_CACHE_TTL_SECONDS,
} from '../parent-access.constants.js';

function cacheKey(tokenId: string): string {
  return `${PARENT_TOKEN_VALID_CACHE_PREFIX}${tokenId}${PARENT_TOKEN_VALID_CACHE_SUFFIX}`;
}

/**
 * `parent_token:{id}:valid` Redis keshi (docs/02 §5, docs/10 §4): qiymat — token bog'langan
 * student id'si. Bekor qilinganda kesh o'chiriladi → keyingi so'rov bazadan tekshiriladi.
 * Redis ishlamasa so'rov yiqilmaydi: kesh "yo'q" deb hisoblanadi (baza — haqiqat manbai).
 */
@Injectable()
export class ParentTokenValidityCache {
  private readonly logger = new Logger(ParentTokenValidityCache.name);

  constructor(private readonly redis: RedisService) {}

  async read(tokenId: string): Promise<string | null> {
    try {
      return await this.redis.get(cacheKey(tokenId));
    } catch (error) {
      this.logger.warn(`Ota-ona tokeni keshini o'qib bo'lmadi: ${String(error)}`);
      return null;
    }
  }

  async remember(tokenId: string, studentId: string): Promise<void> {
    try {
      await this.redis.set(cacheKey(tokenId), studentId, PARENT_TOKEN_VALID_CACHE_TTL_SECONDS);
    } catch (error) {
      this.logger.warn(`Ota-ona tokeni keshiga yozib bo'lmadi: ${String(error)}`);
    }
  }

  /** Bekor qilishda chaqiriladi. Xato bo'lsa — yuqoriga uzatiladi (kesh eskirib qolmasin). */
  async invalidate(tokenId: string): Promise<void> {
    await this.redis.del(cacheKey(tokenId));
  }
}
