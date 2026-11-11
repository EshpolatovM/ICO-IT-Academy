import { Injectable, Logger } from '@nestjs/common';

import { retryWithBackoff } from '../../../common/utils/retry.js';
import { RedisService } from '../../../infra/redis/redis.service.js';
import {
  MENTOR_SCOPE_CACHE_KEY_PREFIX,
  MENTOR_SCOPE_CACHE_KEY_SUFFIX,
  MENTOR_SCOPE_CACHE_TTL_SECONDS,
  MENTOR_SCOPE_EMPTY_MARKER,
  MENTOR_SCOPE_GENERATION_KEY_SUFFIX,
  MENTOR_SCOPE_GENERATION_TTL_SECONDS,
  MENTOR_SCOPE_INVALIDATE_ATTEMPTS,
  MENTOR_SCOPE_INVALIDATE_BACKOFF_MS,
} from '../groups.constants.js';

import type { VersionedKey } from '../../../infra/redis/redis.types.js';

function setKey(mentorId: string): string {
  return `${MENTOR_SCOPE_CACHE_KEY_PREFIX}${mentorId}${MENTOR_SCOPE_CACHE_KEY_SUFFIX}`;
}

function generationKey(mentorId: string): string {
  return `${MENTOR_SCOPE_CACHE_KEY_PREFIX}${mentorId}${MENTOR_SCOPE_GENERATION_KEY_SUFFIX}`;
}

function versionedKey(mentorId: string): VersionedKey {
  return { versionKey: generationKey(mentorId), dataKey: setKey(mentorId) };
}

/**
 * Mentor scope keshi (docs/01 §3.2 p.5, docs/13 §6): Redis set `mentor:{id}:studentIds`, TTL 60 s.
 * - O'qish/yozish xatosi so'rovni yiqitmaydi (bazadan o'qiladi); Redis ishlamay qolsa log faqat
 *   holat o'zgarganda yoziladi (ishlamay qoldi / tiklandi), har so'rovda emas.
 * - Poyga himoyasi: `mentor:{id}:gen` hisoblagichi. O'qish — DB'dan oldin `generation()`, keyin
 *   `store()` faqat hisoblagich o'zgarmagan bo'lsa yozadi (oraliqdagi invalidatsiya eski to'plamni
 *   qayta yozdirmaydi). Invalidatsiya — `INCR gen` + bitta `DEL` (bitta `MULTI`).
 * - Invalidatsiya commit'dan keyin chaqiriladi va HECH QACHON xato tashlamaydi (B1): qisqa backoff
 *   bilan qayta urinadi, bo'lmasa `error` log (mentorId'lar bilan). Eng katta eskirish — TTL (60 s).
 * Bo'sh to'plam ham keshlanadi (`MENTOR_SCOPE_EMPTY_MARKER` belgisi bilan).
 */
@Injectable()
export class MentorScopeCache {
  private readonly logger = new Logger(MentorScopeCache.name);
  /** Oxirgi o'qish/yozish Redis xatosi bilan tugaganmi (log takrorlanmasligi uchun). */
  private unavailable = false;

  constructor(private readonly redis: RedisService) {}

  /** Keshdagi javob; `null` — kesh yo'q (yoki o'qib bo'lmadi). */
  async has(mentorId: string, studentId: string): Promise<boolean | null> {
    return this.guarded(() => this.redis.isSetMember(setKey(mentorId), studentId));
  }

  /**
   * DB'dan o'qishdan OLDIN chaqiriladi: joriy generatsiya (`''` — hisoblagich hali yo'q).
   * `null` — Redis ishlamayapti, natija keshga yozilmaydi.
   */
  async generation(mentorId: string): Promise<string | null> {
    return this.guarded(async () => (await this.redis.get(generationKey(mentorId))) ?? '');
  }

  /** Generatsiya o'zgarmagan bo'lsagina to'plamni yozadi; xato so'rovni yiqitmaydi. */
  async store(mentorId: string, studentIds: readonly string[], generation: string): Promise<void> {
    await this.guarded(() =>
      this.redis.replaceSetIfVersion({
        key: setKey(mentorId),
        versionKey: generationKey(mentorId),
        expectedVersion: generation,
        members: [MENTOR_SCOPE_EMPTY_MARKER, ...studentIds],
        ttlSeconds: MENTOR_SCOPE_CACHE_TTL_SECONDS,
      }),
    );
  }

  /** A'zolik, mentor yoki guruh holati o'zgargandan (commit'dan) keyin. Xato tashlamaydi. */
  async invalidate(...mentorIds: readonly (string | null)[]): Promise<void> {
    const unique = [...new Set(mentorIds.filter((id): id is string => id !== null))];
    if (unique.length === 0) {
      return;
    }
    try {
      await retryWithBackoff(
        () =>
          this.redis.bumpVersionsAndDelete(
            unique.map(versionedKey),
            MENTOR_SCOPE_GENERATION_TTL_SECONDS,
          ),
        {
          attempts: MENTOR_SCOPE_INVALIDATE_ATTEMPTS,
          backoffMs: MENTOR_SCOPE_INVALIDATE_BACKOFF_MS,
        },
      );
    } catch (error) {
      this.logger.error(
        `Mentor scope keshini invalidatsiya qilib bo'lmadi (mentorIds: ${unique.join(', ')}); ` +
          `scope ${MENTOR_SCOPE_CACHE_TTL_SECONDS} s gacha eskirgan bo'lishi mumkin: ${String(error)}`,
      );
    }
  }

  private async guarded<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      const result = await action();
      if (this.unavailable) {
        this.unavailable = false;
        this.logger.log('Mentor scope keshi qayta ishlayapti');
      }
      return result;
    } catch (error) {
      if (!this.unavailable) {
        this.unavailable = true;
        this.logger.warn(`Mentor scope keshi ishlamayapti, bazadan o'qiladi: ${String(error)}`);
      }
      return null;
    }
  }
}
