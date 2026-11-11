import { Injectable } from '@nestjs/common';

import { ErrorCode, Role } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { ParentGrantsService } from '../../parent-access/services/parent-grants.service.js';

import { ParentSessionTokenService } from './parent-session-token.service.js';

import type { ParentRequestUser } from '../../../common/auth/request-user.types.js';
import type {
  IssuedParentSession,
  ParentSessionGrant,
  ParentSessionPayload,
} from '../types/auth.types.js';

export interface ParentAuthentication {
  user: ParentRequestUser;
  /** Sliding: yangilangan sessiya (guard `ps` cookie'ni qayta yozadi); kerak bo'lmasa — `null`. */
  renewed: IssuedParentSession | null;
}

function sessionGrants(payload: ParentSessionPayload): ParentSessionGrant[] {
  return payload.tokenIds.map((tokenId, index) => ({
    tokenId,
    studentId: payload.studentIds[index] ?? '',
  }));
}

/**
 * `ps` cookie bo'yicha ota-onani autentifikatsiya qilish (docs/01 §3.3, docs/10 §3–4): JWT
 * tekshiriladi, so'ng HAR SO'ROVDA har bir token hali amaldaligi (Redis kesh → baza).
 * Bekor qilingan token farzandi sessiyadan chiqadi; birorta ham qolmasa — 401.
 */
@Injectable()
export class ParentSessionAuthenticator {
  constructor(
    private readonly sessionTokens: ParentSessionTokenService,
    private readonly grants: ParentGrantsService,
  ) {}

  async authenticate(sessionToken: string): Promise<ParentAuthentication> {
    const payload = await this.sessionTokens.verify(sessionToken);
    const active = await this.grants.activeStudentsByTokenIds(payload.tokenIds);
    const valid = sessionGrants(payload).filter(
      (grant) => active.get(grant.tokenId) === grant.studentId,
    );
    const [first] = valid;
    if (!first) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    const user: ParentRequestUser = {
      id: first.tokenId,
      role: Role.PARENT,
      mustChangePassword: false,
      tokenIds: valid.map((grant) => grant.tokenId),
      studentIds: [...new Set(valid.map((grant) => grant.studentId))],
    };
    const renewed = this.sessionTokens.shouldRenew(payload)
      ? await this.sessionTokens.sign(valid)
      : null;
    return { user, renewed };
  }
}
