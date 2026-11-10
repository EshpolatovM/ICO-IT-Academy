import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { WRONG_OLD_PASSWORD_MESSAGE } from '../auth.constants.js';

import { PasswordVerifier } from './password-verifier.service.js';
import { SessionIssuer } from './session-issuer.service.js';
import { TokenVersionService } from './token-version.service.js';

import type { ClientMeta } from '../../../common/auth/request-user.types.js';
import type { ChangePasswordDto } from '../dto/auth.dto.js';
import type { TokenResult } from '../types/auth.types.js';

/**
 * `POST /auth/change-password` (docs/02 §4.2): eski parol tekshiriladi, so'ng yangi hash,
 * `must_change_password = false`, `token_version++`, barcha eski refresh tokenlar bekor va
 * yangi access + refresh beriladi.
 */
@Injectable()
export class PasswordChangeService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordVerifier,
    private readonly tokenVersions: TokenVersionService,
    private readonly sessions: SessionIssuer,
  ) {}

  async change(userId: string, dto: ChangePasswordDto, meta: ClientMeta): Promise<TokenResult> {
    const user = await this.users.findAuthById(userId);
    if (!user) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    if (!(await this.passwords.verify(user.passwordHash, dto.oldPassword))) {
      throw new AppException({
        code: ErrorCode.VALIDATION_ERROR,
        details: [{ field: 'oldPassword', message: WRONG_OLD_PASSWORD_MESSAGE }],
      });
    }
    const { tokenVersion } = await this.users.changePassword(user.id, {
      passwordHash: await this.passwords.hash(dto.newPassword),
      revokedAt: new Date(),
    });
    await this.tokenVersions.remember(user.id, tokenVersion);
    const { refreshToken, ...body } = await this.sessions.start(
      { id: user.id, role: user.role, mustChangePassword: false, tokenVersion },
      meta,
    );
    return { body, refreshToken };
  }
}
