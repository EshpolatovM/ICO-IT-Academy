import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';

import type { AuthSessionsResponse } from '@lms/shared';

import { ACCOUNT_ROLES } from '../../../common/constants/roles.constants.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { RefreshTokenCookie } from '../decorators/refresh-token-cookie.decorator.js';
import { SessionsService } from '../services/sessions.service.js';

import type { RequestUser } from '../../../common/auth/request-user.types.js';

/** Faol sessiyalar (qurilmalar) — `GET/DELETE /auth/sessions[/:id]` (docs/12 §1: SA A M S). */
@Roles(...ACCOUNT_ROLES)
@Controller('auth/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  list(
    @CurrentUser() user: RequestUser,
    @RefreshTokenCookie() token: string | undefined,
  ): Promise<AuthSessionsResponse> {
    return this.sessionsService.list(user.id, token);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  revoke(@CurrentUser() user: RequestUser, @UuidParam('id') sessionId: string): Promise<void> {
    return this.sessionsService.revoke(user.id, sessionId);
  }
}
