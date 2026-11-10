import { Injectable } from '@nestjs/common';

import { BaseRepository } from '../../../common/repository/base.repository.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { Prisma, RefreshToken } from '../../../infra/prisma/generated/client.js';
import type { NewRefreshTokenData, RefreshTokenRecord } from '../types/auth.types.js';

interface RefreshTokenRepositoryTypes extends RepositoryTypes {
  model: RefreshToken;
  where: Prisma.RefreshTokenWhereInput;
  create: Prisma.RefreshTokenUncheckedCreateInput;
  update: Prisma.RefreshTokenUncheckedUpdateInput;
  orderBy: Prisma.RefreshTokenOrderByWithRelationInput;
}

/** `RefreshTokenRecord` bilan bir xil ustunlar (`token_hash` tashqariga chiqmaydi). */
const RECORD_SELECT = {
  id: true,
  userId: true,
  familyId: true,
  userAgent: true,
  ip: true,
  expiresAt: true,
  revokedAt: true,
  createdAt: true,
} as const satisfies Prisma.RefreshTokenSelect;

function toCreateInput(data: NewRefreshTokenData): Prisma.RefreshTokenUncheckedCreateInput {
  return {
    userId: data.userId,
    tokenHash: data.tokenHash,
    familyId: data.familyId,
    expiresAt: data.expiresAt,
    ip: data.meta.ip,
    userAgent: data.meta.userAgent,
  };
}

/** `refresh_tokens` jadvali: sessiyalar, rotation va reuse detection (docs/02 §3, docs/11 §1). */
@Injectable()
export class RefreshTokensRepository extends BaseRepository<RefreshTokenRepositoryTypes> {
  protected readonly delegate: PrismaService['db']['refreshToken'];
  protected readonly defaultOrderBy = { createdAt: 'desc' } as const;

  constructor(private readonly prisma: PrismaService) {
    super();
    this.delegate = prisma.db.refreshToken;
  }

  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return this.delegate.findUnique({ where: { tokenHash }, select: RECORD_SELECT });
  }

  async insert(data: NewRefreshTokenData): Promise<void> {
    await this.delegate.create({ data: toCreateInput(data), select: { id: true } });
  }

  /**
   * Rotation — bitta tranzaksiyada: eski token faqat hali bekor qilinmagan bo'lsa "egallanadi"
   * (parallel so'rovda faqat bittasi yutadi), yangisi yaratiladi va eskisiga `replaced_by_id` yoziladi.
   * Eski token allaqachon bekor bo'lsa — `false` (chaqiruvchi buni qayta ishlatish deb hisoblaydi).
   */
  async rotate(oldId: string, next: NewRefreshTokenData, at: Date): Promise<boolean> {
    return this.prisma.db.$transaction(async (tx) => {
      const claimed = await tx.refreshToken.updateMany({
        where: { id: oldId, revokedAt: null },
        data: { revokedAt: at },
      });
      if (claimed.count === 0) {
        return false;
      }
      const created = await tx.refreshToken.create({
        data: toCreateInput(next),
        select: { id: true },
      });
      await tx.refreshToken.update({
        where: { id: oldId },
        data: { replacedById: created.id },
        select: { id: true },
      });
      return true;
    });
  }

  /** Oila (rotation zanjiri) dagi barcha faol tokenlarni bekor qiladi; nechtasi bekor bo'lgani qaytadi. */
  async revokeFamily(familyId: string, at: Date, userId?: string): Promise<number> {
    const result = await this.delegate.updateMany({
      where: { familyId, revokedAt: null, ...(userId === undefined ? {} : { userId }) },
      data: { revokedAt: at },
    });
    return result.count;
  }

  /** Foydalanuvchining faol (bekor qilinmagan, muddati o'tmagan) tokenlari — yangisi birinchi. */
  findActiveByUser(userId: string, now: Date): Promise<RefreshTokenRecord[]> {
    return this.delegate.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: now } },
      orderBy: this.defaultOrderBy,
      select: RECORD_SELECT,
    });
  }
}
