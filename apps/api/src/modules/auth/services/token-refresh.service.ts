import { Injectable } from '@nestjs/common';

import { ErrorCode, UserStatus } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';

import { AccessTokenService } from './access-token.service.js';
import { RefreshTokenService } from './refresh-token.service.js';

import type { ClientMeta } from '../../../common/auth/request-user.types.js';
import type { TokenResult } from '../types/auth.types.js';

/**
 * `POST /auth/refresh` (docs/02 §3): refresh token rotation. Foydalanuvchi o'chirilgan yoki
 * INACTIVE bo'lsa — sessiya (oila) bekor qilinadi va 401.
 */
@Injectable()
export class TokenRefreshService {
  constructor(
    private readonly users: UsersRepository,
    private readonly accessTokens: AccessTokenService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  async refresh(token: string | undefined, meta: ClientMeta): Promise<TokenResult> {
    if (!token) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    const current = await this.refreshTokens.findActive(token);
    const user = await this.users.findAuthById(current.userId);
    if (user?.status !== UserStatus.ACTIVE) {
      await this.refreshTokens.revokeFamily(current.familyId);
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    const refreshToken = await this.refreshTokens.rotate(
      current,
      { userId: user.id, role: user.role },
      meta,
    );
    const body = await this.accessTokens.sign(user);
    return { body, refreshToken };
  }
}
