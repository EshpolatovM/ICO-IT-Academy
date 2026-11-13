import { Injectable, Logger } from '@nestjs/common';

import { retryWithBackoff } from '../../../common/utils/retry.js';
import { RedisService } from '../../../infra/redis/redis.service.js';
import {
  CONTENT_VERSION_BUMP_ATTEMPTS,
  CONTENT_VERSION_BUMP_BACKOFF_MS,
  CONTENT_VERSION_KEY_PREFIX,
  CONTENT_VERSION_KEY_SUFFIX,
} from '../content.constants.js';

export function contentVersionKey(pathId: string): string {
  return `${CONTENT_VERSION_KEY_PREFIX}${pathId}${CONTENT_VERSION_KEY_SUFFIX}`;
}

/**
 * Yo'l kontenti versiyasi (docs/13 §6, 3.2 §5): Redis `content:path:{pathId}:ver` (TTL yo'q).
 * `bump` — commit'dan keyin; HECH QACHON xato tashlamaydi (B1): qisqa backoff bilan qayta urinadi,
 * bo'lmasa `error` log. `current` — 3.3 kesh kalitlari uchun; Redis ishlamasa `null`.
 */
@Injectable()
export class ContentCacheVersion {
  private readonly logger = new Logger(ContentCacheVersion.name);

  constructor(private readonly redis: RedisService) {}

  async bump(pathIds: readonly string[]): Promise<void> {
    const unique = [...new Set(pathIds)];
    if (unique.length === 0) {
      return;
    }
    try {
      await retryWithBackoff(
        () => Promise.all(unique.map((pathId) => this.redis.increment(contentVersionKey(pathId)))),
        { attempts: CONTENT_VERSION_BUMP_ATTEMPTS, backoffMs: CONTENT_VERSION_BUMP_BACKOFF_MS },
      );
    } catch (error) {
      this.logger.error(
        `Kontent versiyasini oshirib bo'lmadi (pathIds: ${unique.join(', ')}); ` +
          `kesh TTL tugaguncha eskirgan bo'lishi mumkin: ${String(error)}`,
      );
    }
  }

  /** Joriy versiya (`'0'` — hali o'zgarmagan); Redis ishlamasa — `null`. */
  async current(pathId: string): Promise<string | null> {
    try {
      return (await this.redis.get(contentVersionKey(pathId))) ?? '0';
    } catch (error) {
      this.logger.warn(`Kontent versiyasini o'qib bo'lmadi: ${String(error)}`);
      return null;
    }
  }
}
