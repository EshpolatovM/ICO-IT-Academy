import { Injectable } from '@nestjs/common';

import { Role } from '@lms/shared';

import { ParentCookiesService } from './parent-cookies.service.js';
import { RefreshCookieService } from './refresh-cookie.service.js';
import { SessionsService } from './sessions.service.js';

import type { RequestUser } from '../../../common/auth/request-user.types.js';
import type { Response } from 'express';

/**
 * `POST /auth/logout` (docs/12 §1: ANY): akkaunt — joriy refresh sessiya bekor, `rt` o'chiriladi;
 * ota-ona — ikkala cookie (`ps`, `parent_tokens`) o'chiriladi (docs/02 §5.1).
 */
@Injectable()
export class LogoutService {
  constructor(
    private readonly sessions: SessionsService,
    private readonly refreshCookie: RefreshCookieService,
    private readonly parentCookies: ParentCookiesService,
  ) {}

  async logout(
    user: RequestUser,
    refreshToken: string | undefined,
    response: Response,
  ): Promise<void> {
    if (user.role === Role.PARENT) {
      this.parentCookies.clearAll(response);
      return;
    }
    await this.sessions.logout(user.id, refreshToken);
    this.refreshCookie.clear(response);
  }
}
