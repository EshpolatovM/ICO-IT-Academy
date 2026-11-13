import { Injectable, Logger } from '@nestjs/common';

import { retryWithBackoff } from '../../../common/utils/retry.js';
import { RedisService } from '../../../infra/redis/redis.service.js';
import {
  STUDENT_PATH_CACHE_KEY_PREFIX,
  STUDENT_PATH_CACHE_TTL_SECONDS,
  STUDENT_PATH_GENERATION_KEY_SUFFIX,
  STUDENT_PATH_GENERATION_TTL_SECONDS,
  STUDENT_PATH_INVALIDATE_ATTEMPTS,
  STUDENT_PATH_INVALIDATE_BACKOFF_MS,
} from '../learning.constants.js';

import type { StudentPathCacheEnvelope } from '../learning.types.js';

export function studentPathKey(studentId: string): string {
  return `${STUDENT_PATH_CACHE_KEY_PREFIX}${studentId}`;
}

function generationKey(studentId: string): string {
  return `${studentPathKey(studentId)}${STUDENT_PATH_GENERATION_KEY_SUFFIX}`;
}

/**
 * Student xaritasi keshi (3.3 §6, docs/11 §16): `path:{studentId}` (konvert), TTL 10 daqiqa.
 * - Hit faqat konvertdagi `pathId` va `contentVersion` joriylari bilan mos bo'lsa (chaqiruvchi tekshiradi).
 * - Poyga himoyasi (`MentorScopeCache` naqshi): `path:{studentId}:gen` — o'qishdan oldin `generation()`,
 *   `store()` faqat u o'zgarmagan bo'lsa yozadi.
 * - Redis xatosi so'rovni yiqitmaydi (`null` — DB'dan hisoblanadi); invalidatsiya xato tashlamaydi
 *   (B1: backoff + `error` log).
 */
@Injectable()
export class StudentPathCache {
  private readonly logger = new Logger(StudentPathCache.name);

  constructor(private readonly redis: RedisService) {}

  async read(studentId: string): Promise<StudentPathCacheEnvelope | null> {
    const raw = await this.guarded(() => this.redis.get(studentPathKey(studentId)));
    return raw ? (JSON.parse(raw) as StudentPathCacheEnvelope) : null;
  }

  /** DB'dan o'qishdan OLDIN: joriy generatsiya (`''` — hali yo'q); `null` — Redis ishlamayapti. */
  async generation(studentId: string): Promise<string | null> {
    return this.guarded(async () => (await this.redis.get(generationKey(studentId))) ?? '');
  }

  async store(
    studentId: string,
    envelope: StudentPathCacheEnvelope,
    generation: string,
  ): Promise<void> {
    await this.guarded(() =>
      this.redis.setIfVersion({
        key: studentPathKey(studentId),
        versionKey: generationKey(studentId),
        expectedVersion: generation,
        value: JSON.stringify(envelope),
        ttlSeconds: STUDENT_PATH_CACHE_TTL_SECONDS,
      }),
    );
  }

  /** Progress o'zgargandan (commit'dan) keyin. Xato tashlamaydi. */
  async invalidate(studentId: string): Promise<void> {
    const entry = { versionKey: generationKey(studentId), dataKey: studentPathKey(studentId) };
    try {
      await retryWithBackoff(
        () => this.redis.bumpVersionsAndDelete([entry], STUDENT_PATH_GENERATION_TTL_SECONDS),
        {
          attempts: STUDENT_PATH_INVALIDATE_ATTEMPTS,
          backoffMs: STUDENT_PATH_INVALIDATE_BACKOFF_MS,
        },
      );
    } catch (error) {
      this.logger.error(
        `Xarita keshini invalidatsiya qilib bo'lmadi (studentId: ${studentId}); ` +
          `${STUDENT_PATH_CACHE_TTL_SECONDS} s gacha eskirgan bo'lishi mumkin: ${String(error)}`,
      );
    }
  }

  private async guarded<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      return await action();
    } catch (error) {
      this.logger.warn(`Xarita keshi ishlamayapti, bazadan hisoblanadi: ${String(error)}`);
      return null;
    }
  }
}
