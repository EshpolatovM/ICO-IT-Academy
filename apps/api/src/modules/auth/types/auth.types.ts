import type { AccessTokenResponse, AccountRole, LoginResponse } from '@lms/shared';

import type { ClientMeta } from '../../../common/auth/request-user.types.js';

/**
 * Access JWT tarkibi (docs/02 §3): `sub`, `role`, `mcp` (must change password), `ver` (token_version).
 * Ota-ona sessiyasi (role=PARENT) — alohida `ps` cookie'dagi JWT (1.6), bu payload emas.
 */
export interface AccessTokenPayload {
  sub: string;
  role: AccountRole;
  mcp: boolean;
  ver: number;
}

/** Access token imzolash uchun foydalanuvchi ma'lumotlari. */
export interface AccessTokenSubject {
  id: string;
  role: AccountRole;
  mustChangePassword: boolean;
  tokenVersion: number;
}

/** Yangi berilgan refresh token (xom qiymat faqat cookie'ga yoziladi, bazada — hash). */
export interface IssuedRefreshToken {
  token: string;
  expiresAt: Date;
}

/** Access + refresh juftligi. */
export interface IssuedTokens extends AccessTokenResponse {
  refreshToken: IssuedRefreshToken;
}

/** Controller'ga qaytadigan natija: javob tanasi va cookie'ga yoziladigan refresh token. */
export interface WithRefreshToken<TBody> {
  body: TBody;
  refreshToken: IssuedRefreshToken;
}

export type LoginResult = WithRefreshToken<LoginResponse>;
export type TokenResult = WithRefreshToken<AccessTokenResponse>;

/** `refresh_tokens` yozuvi (repository'dan tashqarida Prisma tiplari ishlatilmaydi). */
export interface RefreshTokenRecord {
  id: string;
  userId: string;
  familyId: string;
  userAgent: string | null;
  ip: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  /** Rotation'da shu tokenni almashtirgan yangi token (reuse grace oynasi uchun). */
  replacedById: string | null;
  createdAt: Date;
}

export interface NewRefreshTokenData {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  meta: ClientMeta;
}

/** Sessiyadagi token va unga bog'langan farzand (`tokenIds[i]` ↔ `studentIds[i]`, docs/10 §3). */
export interface ParentSessionGrant {
  tokenId: string;
  studentId: string;
}

/**
 * Parent session JWT tarkibi (docs/02 §3, docs/10 §3): `sub` — birinchi token id'si,
 * `role=PARENT`, `tokenIds[]` va `studentIds[]` (bir xil tartibda), `exp` — tugash vaqti (soniya).
 */
export interface ParentSessionPayload {
  sub: string;
  role: 'PARENT';
  tokenIds: string[];
  studentIds: string[];
  exp: number;
}

/** Yangi parent session (`ps` cookie qiymati va tugash vaqti). */
export interface IssuedParentSession {
  token: string;
  expiresAt: Date;
}
