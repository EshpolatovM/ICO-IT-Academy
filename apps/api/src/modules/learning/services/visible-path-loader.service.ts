import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '../../../infra/redis/redis.service.js';
import {
  VISIBLE_PATH_CACHE_TTL_SECONDS,
  VISIBLE_PATH_KEY_PREFIX,
  VISIBLE_PATH_KEY_VERSION_SEPARATOR,
} from '../learning.constants.js';
import { VisiblePathRepository } from '../repositories/visible-path.repository.js';

import type { VisiblePath } from '../learning.types.js';

export function visiblePathKey(pathId: string, version: string): string {
  return `${VISIBLE_PATH_KEY_PREFIX}${pathId}${VISIBLE_PATH_KEY_VERSION_SEPARATOR}${version}`;
}

/**
 * Yo'lning ko'rinadigan tuzilmasi (3.3 §6): `content:path:{pathId}:v{version}` (barcha studentlar
 * uchun umumiy) yoki DB. `version` — `ContentCacheVersion.current` (3.2); `null` (Redis ishlamayapti)
 * bo'lsa kesh ishlatilmaydi. Redis xatosi so'rovni yiqitmaydi.
 */
@Injectable()
export class VisiblePathLoader {
  private readonly logger = new Logger(VisiblePathLoader.name);

  constructor(
    private readonly repository: VisiblePathRepository,
    private readonly redis: RedisService,
  ) {}

  async load(pathId: string, version: string | null): Promise<VisiblePath | null> {
    if (version === null) {
      return this.repository.load(pathId);
    }
    const key = visiblePathKey(pathId, version);
    const cached = await this.guarded(() => this.redis.get(key));
    if (cached) {
      return JSON.parse(cached) as VisiblePath;
    }
    const path = await this.repository.load(pathId);
    if (path !== null) {
      await this.guarded(() =>
        this.redis.set(key, JSON.stringify(path), VISIBLE_PATH_CACHE_TTL_SECONDS),
      );
    }
    return path;
  }

  private async guarded<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      return await action();
    } catch (error) {
      this.logger.warn(`Kontent tuzilmasi keshi ishlamayapti: ${String(error)}`);
      return null;
    }
  }
}
