import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';

import { ErrorCode, Role } from '@lms/shared';
import type { AccessTokenResponse } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import { ACCESS_TOKEN_AUDIENCE } from '../auth.constants.js';

import type { AccessTokenPayload, AccessTokenSubject } from '../types/auth.types.js';

/** Imzosi to'g'ri bo'lsa ham, tarkib shakli tekshiriladi (masalan eski formatdagi token). */
const accessTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum([Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR, Role.STUDENT]),
  mcp: z.boolean(),
  ver: z.number().int(),
});

/**
 * Access JWT (docs/02 §3): imzolash va tekshirish. Sir, algoritm va muddat — `AuthModule` dagi
 * `JwtModule` sozlamasida (env'dan). `aud=access` — parent session JWT (`aud=parent-session`, bir xil
 * kalit) access token o'rnida o'tmaydi va aksincha.
 */
@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async sign(subject: AccessTokenSubject): Promise<AccessTokenResponse> {
    const payload: AccessTokenPayload = {
      sub: subject.id,
      role: subject.role,
      mcp: subject.mustChangePassword,
      ver: subject.tokenVersion,
    };
    const accessToken = await this.jwt.signAsync(payload, { audience: ACCESS_TOKEN_AUDIENCE });
    return { accessToken, expiresIn: this.config.get('JWT_ACCESS_TTL_SECONDS') };
  }

  /** Imzo, muddat yoki tarkib noto'g'ri bo'lsa — 401. */
  async verify(token: string): Promise<AccessTokenPayload> {
    let decoded: unknown;
    try {
      decoded = await this.jwt.verifyAsync<object>(token, { audience: ACCESS_TOKEN_AUDIENCE });
    } catch (error) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED, cause: error });
    }
    const parsed = accessTokenPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    return parsed.data;
  }
}
