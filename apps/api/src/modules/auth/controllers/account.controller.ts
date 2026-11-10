import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';

import type { AccessTokenResponse, AuthUser } from '@lms/shared';

import { ACCOUNT_ROLES } from '../../../common/constants/roles.constants.js';
import { AllowPendingPasswordChange } from '../../../common/decorators/allow-pending-password-change.decorator.js';
import { ClientMeta } from '../../../common/decorators/client-meta.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RefreshTokenCookie } from '../decorators/refresh-token-cookie.decorator.js';
import { ChangePasswordDto } from '../dto/auth.dto.js';
import { MeService } from '../services/me.service.js';
import { PasswordChangeService } from '../services/password-change.service.js';
import { RefreshCookieService } from '../services/refresh-cookie.service.js';
import { SessionsService } from '../services/sessions.service.js';

import type {
  ClientMeta as ClientMetaValue,
  RequestUser,
} from '../../../common/auth/request-user.types.js';
import type { Response } from 'express';

/**
 * Kirgan foydalanuvchining auth amallari (docs/12 §1): `me` (ANY), `logout` (ANY),
 * `change-password` (SA A M S). Uchalasi `must_change_password = true` bo'lsa ham ishlaydi
 * (docs/02 §3; logout — foydalanuvchi qurilmadan chiqib keta olishi uchun).
 */
@AllowPendingPasswordChange()
@Controller('auth')
export class AccountController {
  constructor(
    private readonly meService: MeService,
    private readonly passwordChangeService: PasswordChangeService,
    private readonly sessionsService: SessionsService,
    private readonly refreshCookie: RefreshCookieService,
  ) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser): Promise<AuthUser> {
    return this.meService.getMe(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: RequestUser,
    @RefreshTokenCookie() token: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.sessionsService.logout(user.id, token);
    this.refreshCookie.clear(response);
  }

  @Roles(...ACCOUNT_ROLES)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
    @ClientMeta() meta: ClientMetaValue,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenResponse> {
    const { body, refreshToken } = await this.passwordChangeService.change(user.id, dto, meta);
    this.refreshCookie.set(response, refreshToken);
    return body;
  }
}
