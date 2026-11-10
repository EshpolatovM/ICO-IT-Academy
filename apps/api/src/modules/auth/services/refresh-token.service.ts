import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';

import { ErrorCode, Role } from '@lms/shared';
import type { AccountRole } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import { MS_PER_SECOND, REFRESH_TOKEN_BYTES } from '../auth.constants.js';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository.js';

import type { ClientMeta } from '../../../common/auth/request-user.types.js';
import type {
  IssuedRefreshToken,
  NewRefreshTokenData,
  RefreshTokenRecord,
} from '../types/auth.types.js';

export interface RefreshTokenOwner {
  userId: string;
  role: AccountRole;
}

/** Refresh token bazada faqat SHA-256 hash ko'rinishida saqlanadi (docs/11 §1: `token_hash char(64)`). */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Opaque refresh tokenlar (docs/02 §3): yaratish, rotation va reuse detection.
 * Bekor qilingan token qayta kelsa — shu oila (rotation zanjiri, `family_id`) to'liq bekor qilinadi.
 */
@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly tokens: RefreshTokensRepository,
    private readonly config: AppConfigService,
  ) {}

  /** Yangi sessiya (yangi oila) uchun token. */
  async issue(owner: RefreshTokenOwner, meta: ClientMeta): Promise<IssuedRefreshToken> {
    const { issued, data } = this.prepare(owner, meta, randomUUID());
    await this.tokens.insert(data);
    return issued;
  }

  /**
   * Cookie'dagi token bo'yicha faol yozuv. Topilmasa yoki muddati o'tgan bo'lsa — 401.
   * Bekor qilingan bo'lsa (qayta ishlatish) — butun oila bekor qilinadi va 401.
   */
  async findActive(token: string): Promise<RefreshTokenRecord> {
    const record = await this.tokens.findByHash(hashRefreshToken(token));
    if (!record) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    if (record.revokedAt) {
      await this.handleReuse(record);
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    return record;
  }

  /** Eski tokenni bekor qilib, shu oilada yangisini beradi. Poygada yutqazilsa — reuse sifatida. */
  async rotate(
    current: RefreshTokenRecord,
    owner: RefreshTokenOwner,
    meta: ClientMeta,
  ): Promise<IssuedRefreshToken> {
    const { issued, data } = this.prepare(owner, meta, current.familyId);
    const rotated = await this.tokens.rotate(current.id, data, new Date());
    if (!rotated) {
      await this.handleReuse(current);
    }
    return issued;
  }

  async revokeFamily(familyId: string, userId?: string): Promise<number> {
    return this.tokens.revokeFamily(familyId, new Date(), userId);
  }

  /** Token shu foydalanuvchiga tegishli bo'lsa — uning oilasi (sessiya) id'si, aks holda `null`. */
  async findFamilyId(token: string, userId: string): Promise<string | null> {
    const record = await this.tokens.findByHash(hashRefreshToken(token));
    return record?.userId === userId ? record.familyId : null;
  }

  findActiveByUser(userId: string): Promise<RefreshTokenRecord[]> {
    return this.tokens.findActiveByUser(userId, new Date());
  }

  private async handleReuse(record: RefreshTokenRecord): Promise<never> {
    const revoked = await this.revokeFamily(record.familyId);
    this.logger.warn(
      `Refresh token qayta ishlatildi: user=${record.userId} family=${record.familyId}, bekor qilindi: ${revoked}`,
    );
    throw new AppException({ code: ErrorCode.UNAUTHORIZED });
  }

  private prepare(owner: RefreshTokenOwner, meta: ClientMeta, familyId: string) {
    const token = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const expiresAt = new Date(Date.now() + this.ttlSeconds(owner.role) * MS_PER_SECOND);
    const data: NewRefreshTokenData = {
      userId: owner.userId,
      tokenHash: hashRefreshToken(token),
      familyId,
      expiresAt,
      meta,
    };
    return { issued: { token, expiresAt }, data };
  }

  /** Muddat rolga qarab (docs/02 §3, S-12): student va staff uchun alohida, env'dan. */
  private ttlSeconds(role: AccountRole): number {
    return role === Role.STUDENT
      ? this.config.get('REFRESH_TTL_STUDENT_SECONDS')
      : this.config.get('REFRESH_TTL_STAFF_SECONDS');
  }
}
