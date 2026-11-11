import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';
import type { AuthSession, AuthSessionsResponse } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';

import { RefreshTokenService } from './refresh-token.service.js';

import type { RefreshTokenRecord } from '../types/auth.types.js';

function toAuthSession(record: RefreshTokenRecord, currentFamilyId: string | null): AuthSession {
  return {
    id: record.familyId,
    userAgent: record.userAgent,
    ip: record.ip,
    lastActiveAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
    current: record.familyId === currentFamilyId,
  };
}

/**
 * Faol sessiyalar (docs/02 §6) va chiqish. Sessiya = refresh token oilasi (`family_id`):
 * rotation'da id o'zgarmaydi, oiladagi faol token bitta.
 */
@Injectable()
export class SessionsService {
  constructor(private readonly refreshTokens: RefreshTokenService) {}

  async list(userId: string, currentToken: string | undefined): Promise<AuthSessionsResponse> {
    const [records, currentFamilyId] = await Promise.all([
      this.refreshTokens.findActiveByUser(userId),
      this.currentFamilyId(userId, currentToken),
    ]);
    return { items: records.map((record) => toAuthSession(record, currentFamilyId)) };
  }

  /** Boshqa foydalanuvchining yoki mavjud bo'lmagan sessiya — 404 (docs/12 §0). */
  async revoke(userId: string, sessionId: string): Promise<void> {
    const revoked = await this.refreshTokens.revokeFamily(sessionId, userId);
    if (revoked === 0) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
  }

  /** Joriy qurilma sessiyasini bekor qiladi (cookie bo'lmasa — hech narsa qilinmaydi). */
  async logout(userId: string, currentToken: string | undefined): Promise<void> {
    const familyId = await this.currentFamilyId(userId, currentToken);
    if (familyId) {
      await this.refreshTokens.revokeFamily(familyId, userId);
    }
  }

  private async currentFamilyId(userId: string, token: string | undefined): Promise<string | null> {
    return token ? this.refreshTokens.findFamilyId(token, userId) : null;
  }
}
