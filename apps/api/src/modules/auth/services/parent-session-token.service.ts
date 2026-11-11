import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';

import { ErrorCode, Role } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import {
  MS_PER_SECOND,
  PARENT_SESSION_AUDIENCE,
  PARENT_SESSION_RENEW_REMAINING_RATIO,
} from '../auth.constants.js';

import type {
  IssuedParentSession,
  ParentSessionGrant,
  ParentSessionPayload,
} from '../types/auth.types.js';

const parentSessionPayloadSchema = z
  .object({
    sub: z.string().min(1),
    role: z.literal(Role.PARENT),
    tokenIds: z.array(z.string().min(1)).min(1),
    studentIds: z.array(z.string().min(1)).min(1),
    exp: z.number().int(),
  })
  .refine((payload) => payload.tokenIds.length === payload.studentIds.length);

/**
 * Parent session JWT (`ps` cookie, docs/02 §3): imzolash va tekshirish. Kalit — access JWT bilan
 * bir xil (`JwtModule`), lekin alohida `aud` va tarkib sxemasi: biri o'rnida ikkinchisi o'tmaydi.
 * Muddat — `PARENT_SESSION_TTL_SECONDS`.
 */
@Injectable()
export class ParentSessionTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async sign(grants: readonly ParentSessionGrant[]): Promise<IssuedParentSession> {
    const [first] = grants;
    if (!first) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    const ttlSeconds = this.config.get('PARENT_SESSION_TTL_SECONDS');
    const token = await this.jwt.signAsync(
      {
        role: Role.PARENT,
        tokenIds: grants.map((grant) => grant.tokenId),
        studentIds: grants.map((grant) => grant.studentId),
      },
      { subject: first.tokenId, audience: PARENT_SESSION_AUDIENCE, expiresIn: ttlSeconds },
    );
    return { token, expiresAt: new Date(Date.now() + ttlSeconds * MS_PER_SECOND) };
  }

  /** Imzo, muddat, auditoriya yoki tarkib noto'g'ri bo'lsa — 401. */
  async verify(token: string): Promise<ParentSessionPayload> {
    let decoded: unknown;
    try {
      decoded = await this.jwt.verifyAsync<object>(token, { audience: PARENT_SESSION_AUDIENCE });
    } catch (error) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED, cause: error });
    }
    const parsed = parentSessionPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    return parsed.data;
  }

  /** Sliding: qolgan muddat belgilangan ulushdan kam bo'lsa — sessiya yangilanadi. */
  shouldRenew(payload: ParentSessionPayload): boolean {
    const remainingSeconds = payload.exp - Date.now() / MS_PER_SECOND;
    const ttlSeconds = this.config.get('PARENT_SESSION_TTL_SECONDS');
    return remainingSeconds < ttlSeconds * PARENT_SESSION_RENEW_REMAINING_RATIO;
  }
}
