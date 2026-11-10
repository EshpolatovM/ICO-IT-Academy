import { Injectable } from '@nestjs/common';

import { ErrorCode, UserStatus } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { INVALID_CREDENTIALS_MESSAGE } from '../auth.constants.js';
import { toAuthUser } from '../mappers/auth-user.mapper.js';

import { LoginRateLimiter } from './login-rate-limiter.service.js';
import { PasswordVerifier } from './password-verifier.service.js';
import { SessionIssuer } from './session-issuer.service.js';

import type { LoginKind } from './login-rate-limiter.service.js';
import type { ClientMeta } from '../../../common/auth/request-user.types.js';
import type { UserAuthRecord } from '../../users/users.types.js';
import type { StaffLoginDto, StudentLoginDto } from '../dto/auth.dto.js';
import type { LoginResult } from '../types/auth.types.js';

interface LoginAttempt {
  kind: LoginKind;
  login: string;
  password: string;
  meta: ClientMeta;
  findUser: () => Promise<UserAuthRecord | null>;
}

/**
 * Staff (telefon + parol) va student (ID + parol) kirishi (docs/02 §4.1, §4.2).
 * Har qanday xato (topilmadi, parol noto'g'ri, INACTIVE) — bir xil 401 xabar.
 */
@Injectable()
export class LoginService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordVerifier,
    private readonly rateLimiter: LoginRateLimiter,
    private readonly sessions: SessionIssuer,
  ) {}

  loginStaff(dto: StaffLoginDto, meta: ClientMeta): Promise<LoginResult> {
    return this.login({
      kind: 'staff',
      login: dto.phone,
      password: dto.password,
      meta,
      findUser: () => this.users.findStaffByPhone(dto.phone),
    });
  }

  loginStudent(dto: StudentLoginDto, meta: ClientMeta): Promise<LoginResult> {
    return this.login({
      kind: 'student',
      login: dto.studentCode,
      password: dto.password,
      meta,
      findUser: () => this.users.findStudentByCode(dto.studentCode),
    });
  }

  private async login(attempt: LoginAttempt): Promise<LoginResult> {
    const limiterKey = { kind: attempt.kind, ip: attempt.meta.ip, login: attempt.login };
    // Urinish parol tekshiruvidan OLDIN sanaladi (parallel so'rovlar ham limitga tushadi).
    await this.rateLimiter.consume(limiterKey);
    const user = await this.authenticate(attempt);
    if (!user) {
      throw new AppException({
        code: ErrorCode.UNAUTHORIZED,
        message: INVALID_CREDENTIALS_MESSAGE,
      });
    }
    await this.rateLimiter.succeed(limiterKey);
    await this.users.markLoggedIn(user.id, new Date());
    const { refreshToken, ...access } = await this.sessions.start(user, attempt.meta);
    return { body: { ...access, user: toAuthUser(user) }, refreshToken };
  }

  /** Parol har doim tekshiriladi (topilmasa — soxta hash bilan), so'ng holat. */
  private async authenticate(attempt: LoginAttempt): Promise<UserAuthRecord | null> {
    const user = await attempt.findUser();
    const passwordMatches = await this.passwords.verify(
      user?.passwordHash ?? null,
      attempt.password,
    );
    return user && passwordMatches && user.status === UserStatus.ACTIVE ? user : null;
  }
}
