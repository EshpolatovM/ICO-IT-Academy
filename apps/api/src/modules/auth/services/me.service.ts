import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';
import type { AuthUser } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { toAuthUser } from '../mappers/auth-user.mapper.js';

/** `GET /auth/me` — joriy foydalanuvchi (docs/12 §1). */
@Injectable()
export class MeService {
  constructor(private readonly users: UsersRepository) {}

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.users.findAuthById(userId);
    if (!user) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    return toAuthUser(user);
  }
}
