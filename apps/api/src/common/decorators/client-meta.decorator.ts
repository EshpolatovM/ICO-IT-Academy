import { createParamDecorator } from '@nestjs/common';

import type { ClientMeta as ClientMetaValue } from '../auth/request-user.types.js';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** `refresh_tokens.user_agent` uzunligi (docs/11 §1: varchar(256)). */
export const USER_AGENT_MAX_LENGTH = 256;

export function clientMetaFromRequest(request: Request): ClientMetaValue {
  const userAgent = request.get('user-agent');
  return {
    ip: request.ip ?? null,
    userAgent: userAgent ? userAgent.slice(0, USER_AGENT_MAX_LENGTH) : null,
  };
}

/** So'rov yuborgan mijozning IP manzili va `User-Agent` sarlavhasi. */
export const ClientMeta = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  clientMetaFromRequest(context.switchToHttp().getRequest<Request>()),
);
