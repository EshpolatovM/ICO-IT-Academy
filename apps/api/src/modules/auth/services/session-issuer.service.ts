import { Injectable } from '@nestjs/common';

import { AccessTokenService } from './access-token.service.js';
import { RefreshTokenService } from './refresh-token.service.js';

import type { ClientMeta } from '../../../common/auth/request-user.types.js';
import type { AccessTokenSubject, IssuedTokens } from '../types/auth.types.js';

/** Yangi sessiya: access token + yangi oiladagi refresh token (login va parol almashtirishda). */
@Injectable()
export class SessionIssuer {
  constructor(
    private readonly accessTokens: AccessTokenService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  async start(subject: AccessTokenSubject, meta: ClientMeta): Promise<IssuedTokens> {
    const [access, refreshToken] = await Promise.all([
      this.accessTokens.sign(subject),
      this.refreshTokens.issue({ userId: subject.id, role: subject.role }, meta),
    ]);
    return { ...access, refreshToken };
  }
}
