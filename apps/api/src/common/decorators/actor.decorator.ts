import { createParamDecorator } from '@nestjs/common';

import { clientMetaFromRequest } from './client-meta.decorator.js';
import { currentUserFromContext } from './current-user.decorator.js';

import type { ActorContext } from '../auth/request-user.types.js';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Joriy foydalanuvchi va uning mijozi (IP, User-Agent) — audit qilinadigan amallar uchun. */
export const Actor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActorContext => ({
    user: currentUserFromContext(context),
    meta: clientMetaFromRequest(context.switchToHttp().getRequest<Request>()),
  }),
);
