import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from '../auth.constants.js';

import type { IssuedRefreshToken } from '../types/auth.types.js';
import type { CookieOptions, Response } from 'express';

/** `rt` cookie (docs/12 §1): `HttpOnly; SameSite=Strict; Path=/api/v1/auth`, `Secure` — env'dan. */
@Injectable()
export class RefreshCookieService {
  constructor(private readonly config: AppConfigService) {}

  set(response: Response, refreshToken: IssuedRefreshToken): void {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken.token, {
      ...this.baseOptions(),
      expires: refreshToken.expiresAt,
    });
  }

  clear(response: Response): void {
    response.clearCookie(REFRESH_COOKIE_NAME, this.baseOptions());
  }

  private baseOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE'),
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
    };
  }
}
