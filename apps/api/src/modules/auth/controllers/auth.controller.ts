import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';

import type { AccessTokenResponse, LoginResponse } from '@lms/shared';

import { ClientMeta } from '../../../common/decorators/client-meta.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { CsrfHeaderGuard } from '../../../common/guards/csrf-header.guard.js';
import { RefreshTokenCookie } from '../decorators/refresh-token-cookie.decorator.js';
import { StaffLoginDto, StudentLoginDto } from '../dto/auth.dto.js';
import { LoginService } from '../services/login.service.js';
import { RefreshCookieService } from '../services/refresh-cookie.service.js';
import { TokenRefreshService } from '../services/token-refresh.service.js';

import type { ClientMeta as ClientMetaValue } from '../../../common/auth/request-user.types.js';
import type { Response } from 'express';

/** Kirish va token yangilash (docs/12 §1: PUB / cookie). Refresh token faqat `rt` HttpOnly cookie'da. */
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginService: LoginService,
    private readonly tokenRefreshService: TokenRefreshService,
    private readonly refreshCookie: RefreshCookieService,
  ) {}

  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  async staffLogin(
    @Body() dto: StaffLoginDto,
    @ClientMeta() meta: ClientMetaValue,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const { body, refreshToken } = await this.loginService.loginStaff(dto, meta);
    this.refreshCookie.set(response, refreshToken);
    return body;
  }

  @Post('student/login')
  @HttpCode(HttpStatus.OK)
  async studentLogin(
    @Body() dto: StudentLoginDto,
    @ClientMeta() meta: ClientMetaValue,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const { body, refreshToken } = await this.loginService.loginStudent(dto, meta);
    this.refreshCookie.set(response, refreshToken);
    return body;
  }

  /** Rotation (docs/02 §3). CSRF: `X-Requested-With` majburiy (docs/02 §6). */
  @UseGuards(CsrfHeaderGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @RefreshTokenCookie() token: string | undefined,
    @ClientMeta() meta: ClientMetaValue,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenResponse> {
    const { body, refreshToken } = await this.tokenRefreshService.refresh(token, meta);
    this.refreshCookie.set(response, refreshToken);
    return body;
  }
}
