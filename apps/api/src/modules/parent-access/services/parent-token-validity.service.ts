import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '../../../infra/redis/redis.service.js';
import {
  PARENT_TOKEN_REVOKED_CACHE_SUFFIX,
  PARENT_TOKEN_REVOKED_MARKER,
  PARENT_TOKEN_REVOKED_TOMBSTONE_TTL_SECONDS,
  PARENT_TOKEN_VALID_CACHE_PREFIX,
  PARENT_TOKEN_VALID_CACHE_SUFFIX,
  PARENT_TOKEN_VALID_CACHE_TTL_SECONDS,
} from '../parent-access.constants.js';

/** Keshdagi holat: amalda (student id bilan), bekor qilingan (tombstone) yoki noma'lum (bazaga qarash kerak). */
export type CachedTokenValidity =
  { state: 'valid'; studentId: string } | { state: 'revoked' } | { state: 'unknown' };

const UNKNOWN: CachedTokenValidity = { state: 'unknown' };

function validKey(tokenId: string): string {
  return `${PARENT_TOKEN_VALID_CACHE_PREFIX}${tokenId}${PARENT_TOKEN_VALID_CACHE_SUFFIX}`;
}

function revokedKey(tokenId: string): string {
  return `${PARENT_TOKEN_VALID_CACHE_PREFIX}${tokenId}${PARENT_TOKEN_REVOKED_CACHE_SUFFIX}`;
}

/**
 * `parent_token:{id}:valid` Redis keshi (docs/02 §5, docs/10 §4): qiymat — token bog'langan
 * student id'si. Bekor qilinganda `:revoked` tombstone qo'yiladi va `:valid` o'chiriladi.
 * Redis ishlamasa so'rov yiqilmaydi: kesh "noma'lum" deb hisoblanadi (baza — haqiqat manbai);
 * bekor qilishda Redis xatosi logga yoziladi, amal (bazada allaqachon bajarilgan) 500 ga aylanmaydi.
 */
@Injectable()
export class ParentTokenValidityCache {
  private readonly logger = new Logger(ParentTokenValidityCache.name);

  constructor(private readonly redis: RedisService) {}

  async read(tokenId: string): Promise<CachedTokenValidity> {
    try {
      const [studentId, revoked] = await this.redis.getMany([
        validKey(tokenId),
        revokedKey(tokenId),
      ]);
      if (revoked) {
        return { state: 'revoked' };
      }
      return studentId ? { state: 'valid', studentId } : UNKNOWN;
    } catch (error) {
      this.logger.warn(`Ota-ona tokeni keshini o'qib bo'lmadi: ${String(error)}`);
      return UNKNOWN;
    }
  }

  /** Bazadan tasdiqlangan holatni keshlaydi — tombstone bo'lsa yozilmaydi (atomar). */
  async remember(tokenId: string, studentId: string): Promise<void> {
    try {
      await this.redis.setUnlessExists(
        validKey(tokenId),
        revokedKey(tokenId),
        studentId,
        PARENT_TOKEN_VALID_CACHE_TTL_SECONDS,
      );
    } catch (error) {
      this.logger.warn(`Ota-ona tokeni keshiga yozib bo'lmadi: ${String(error)}`);
    }
  }

  /** Bekor qilishdan keyin: tombstone, so'ng `:valid` o'chiriladi. Xato — log, yuqoriga uzatilmaydi. */
  async markRevoked(tokenId: string): Promise<void> {
    try {
      await this.redis.set(
        revokedKey(tokenId),
        PARENT_TOKEN_REVOKED_MARKER,
        PARENT_TOKEN_REVOKED_TOMBSTONE_TTL_SECONDS,
      );
      await this.redis.del(validKey(tokenId));
    } catch (error) {
      this.logger.error(
        `Ota-ona tokeni ${tokenId} keshini bekor qilib bo'lmadi (kesh TTL tugaguncha eskirgan bo'lishi mumkin): ${String(error)}`,
      );
    }
  }

  /**
   * Tombstone'ni olib tashlaydi — token bazada hali faol bo'lsa (masalan student qayta
   * aktivlashtirilganda), keyingi so'rov bazadan tekshiradi va keshni qayta yozadi.
   * Xato — log, yuqoriga uzatilmaydi (tombstone TTL tugagach baribir o'chadi).
   */
  async clearRevoked(tokenId: string): Promise<void> {
    try {
      await this.redis.del(revokedKey(tokenId));
    } catch (error) {
      this.logger.warn(
        `Ota-ona tokeni ${tokenId} tombstone'ini o'chirib bo'lmadi: ${String(error)}`,
      );
    }
  }
}
