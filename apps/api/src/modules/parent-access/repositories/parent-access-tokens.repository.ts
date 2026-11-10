import { Injectable } from '@nestjs/common';

import { ParentAccessAction, UserStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';
import type {
  NewParentTokenData,
  ParentAccessLogMeta,
  ParentGrant,
  ParentGrantWithHash,
  ParentTokenRecord,
  RegeneratedTokens,
  RevokeData,
} from '../parent-access.types.js';

const RECORD_SELECT = {
  id: true,
  studentId: true,
  tokenPrefix: true,
  label: true,
  createdAt: true,
  lastUsedAt: true,
  useCount: true,
  expiresAt: true,
} as const satisfies Prisma.ParentAccessTokenSelect;

const GRANT_SELECT = {
  id: true,
  tokenHash: true,
  studentId: true,
  student: { select: { firstName: true, lastName: true } },
} as const satisfies Prisma.ParentAccessTokenSelect;

type GrantRow = Prisma.ParentAccessTokenGetPayload<{ select: typeof GRANT_SELECT }>;

/** Faol token: bekor qilinmagan va muddati o'tmagan (docs/02 §5; `expires_at` ixtiyoriy, S-16). */
function activeWhere(now: Date): Prisma.ParentAccessTokenWhereInput {
  return { revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
}

/** Faol token + faol (INACTIVE/o'chirilmagan) student — ota-ona kira oladigan holat. */
function grantWhere(now: Date): Prisma.ParentAccessTokenWhereInput {
  return {
    ...activeWhere(now),
    student: { status: UserStatus.ACTIVE, deletedAt: null },
  };
}

/** Studentning faol tokenini bekor qilish (`updateMany` — poygada faqat bittasi "egallaydi"). */
function revokeArgs(revoke: RevokeData) {
  return {
    where: { id: revoke.tokenId, studentId: revoke.studentId, ...activeWhere(revoke.at) },
    data: { revokedAt: revoke.at, revokedById: revoke.revokedById },
  } satisfies Prisma.ParentAccessTokenUpdateManyArgs;
}

function toGrant(row: GrantRow): ParentGrantWithHash {
  return {
    tokenId: row.id,
    tokenHash: row.tokenHash,
    studentId: row.studentId,
    firstName: row.student.firstName,
    lastName: row.student.lastName,
  };
}

/** `parent_access_tokens` va `parent_access_logs` jadvallari (docs/11 §1). */
@Injectable()
export class ParentAccessTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  listActive(studentId: string, now: Date): Promise<ParentTokenRecord[]> {
    return this.prisma.db.parentAccessToken.findMany({
      where: { studentId, ...activeWhere(now) },
      orderBy: { createdAt: 'desc' },
      select: RECORD_SELECT,
    });
  }

  /**
   * Limit ichida yaratish — poygasiz: student qatori `FOR UPDATE` bilan qulflanadi, so'ng faol
   * tokenlar sanaladi. Limit to'lgan bo'lsa — `null`.
   */
  async createWithinLimit(
    data: NewParentTokenData,
    limit: number,
    now: Date,
  ): Promise<ParentTokenRecord | null> {
    return this.prisma.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${data.studentId}::uuid FOR UPDATE`;
      const active = await tx.parentAccessToken.count({
        where: { studentId: data.studentId, ...activeWhere(now) },
      });
      if (active >= limit) {
        return null;
      }
      return tx.parentAccessToken.create({ data, select: RECORD_SELECT });
    });
  }

  /** Studentning faol tokenini bekor qiladi; topilmasa (yoki allaqachon bekor) — `null`. */
  async revoke(revoke: RevokeData): Promise<ParentTokenRecord | null> {
    return this.prisma.db.$transaction(async (tx) => {
      const claimed = await tx.parentAccessToken.updateMany(revokeArgs(revoke));
      return claimed.count === 0
        ? null
        : tx.parentAccessToken.findUnique({ where: { id: revoke.tokenId }, select: RECORD_SELECT });
    });
  }

  /** Regenerate = revoke + create, bitta tranzaksiyada (docs/02 §5). Eski token faol bo'lmasa — `null`. */
  async regenerate(
    revoke: RevokeData,
    next: Omit<NewParentTokenData, 'label'>,
  ): Promise<RegeneratedTokens | null> {
    return this.prisma.db.$transaction(async (tx) => {
      const claimed = await tx.parentAccessToken.updateMany(revokeArgs(revoke));
      if (claimed.count === 0) {
        return null;
      }
      const revoked = await tx.parentAccessToken.findUniqueOrThrow({
        where: { id: revoke.tokenId },
        select: RECORD_SELECT,
      });
      const created = await tx.parentAccessToken.create({
        data: { ...next, label: revoked.label },
        select: RECORD_SELECT,
      });
      return { revoked, created };
    });
  }

  async findGrantsByHashes(tokenHashes: string[], now: Date): Promise<ParentGrantWithHash[]> {
    const rows = await this.prisma.db.parentAccessToken.findMany({
      where: { tokenHash: { in: tokenHashes }, ...grantWhere(now) },
      select: GRANT_SELECT,
    });
    return rows.map(toGrant);
  }

  async findGrantsByIds(tokenIds: string[], now: Date): Promise<ParentGrant[]> {
    const rows = await this.prisma.db.parentAccessToken.findMany({
      where: { id: { in: tokenIds }, ...grantWhere(now) },
      select: GRANT_SELECT,
    });
    return rows.map(toGrant).map(({ tokenHash: _hash, ...grant }) => grant);
  }

  /** Exchange'dan keyin: `last_used_at`, `use_count++` va `parent_access_logs` (EXCHANGE). */
  async recordExchange(
    grants: readonly ParentGrant[],
    meta: ParentAccessLogMeta,
    at: Date,
  ): Promise<void> {
    const tokenIds = grants.map((grant) => grant.tokenId);
    await this.prisma.db.$transaction([
      this.prisma.db.parentAccessToken.updateMany({
        where: { id: { in: tokenIds } },
        data: { lastUsedAt: at, useCount: { increment: 1 } },
      }),
      this.prisma.db.parentAccessLog.createMany({
        data: grants.map((grant) => ({
          tokenId: grant.tokenId,
          studentId: grant.studentId,
          ip: meta.ip,
          userAgent: meta.userAgent,
          action: ParentAccessAction.EXCHANGE,
          createdAt: at,
        })),
      }),
    ]);
  }
}
