import { createParamDecorator } from '@nestjs/common';

import { REFRESH_COOKIE_NAME } from '../auth.constants.js';

import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export function refreshTokenFromRequest(request: Request): string | undefined {
  const value: unknown = request.cookies[REFRESH_COOKIE_NAME];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** `rt` cookie'dagi xom refresh token (`cookie-parser` orqali); bo'lmasa — `undefined`. */
export const RefreshTokenCookie = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    refreshTokenFromRequest(context.switchToHttp().getRequest<Request>()),
);
