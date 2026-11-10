import { createParamDecorator } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';

import type { AuthenticatedRequest, RequestUser } from '../auth/request-user.types.js';
import type { ExecutionContext } from '@nestjs/common';

export function currentUserFromContext(context: ExecutionContext): RequestUser {
  const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!user) {
    throw new AppException({ code: ErrorCode.UNAUTHORIZED });
  }
  return user;
}

/** `JwtAuthGuard` qo'ygan joriy foydalanuvchi (`request.user`). */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  currentUserFromContext(context),
);
