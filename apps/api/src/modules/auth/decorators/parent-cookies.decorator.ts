import { createParamDecorator } from '@nestjs/common';

import { readCookie } from '../../../common/utils/read-cookie.js';
import { PARENT_SESSION_COOKIE_NAME, PARENT_TOKENS_COOKIE_NAME } from '../auth.constants.js';

import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** `ps` cookie'dagi parent session JWT; bo'lmasa — `undefined`. */
export function parentSessionFromRequest(request: Request): string | undefined {
  return readCookie(request, PARENT_SESSION_COOKIE_NAME);
}

/** `parent_tokens` cookie'ning shifrlangan qiymati (faqat `/api/v1/auth/parent` ga keladi). */
export const ParentTokensCookie = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    readCookie(context.switchToHttp().getRequest<Request>(), PARENT_TOKENS_COOKIE_NAME),
);
