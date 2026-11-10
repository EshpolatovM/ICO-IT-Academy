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
  createdAt: Date;
}

export interface NewRefreshTokenData {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  meta: ClientMeta;
}
