import { createParamDecorator } from '@nestjs/common';

import { readCookie } from '../../../common/utils/read-cookie.js';
import { REFRESH_COOKIE_NAME } from '../auth.constants.js';

import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export function refreshTokenFromRequest(request: Request): string | undefined {
  return readCookie(request, REFRESH_COOKIE_NAME);
}

/** `rt` cookie'dagi xom refresh token (`cookie-parser` orqali); bo'lmasa — `undefined`. */
export const RefreshTokenCookie = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    refreshTokenFromRequest(context.switchToHttp().getRequest<Request>()),
);
