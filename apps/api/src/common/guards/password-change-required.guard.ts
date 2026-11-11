import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@lms/shared';

import { ALLOW_PENDING_PASSWORD_CHANGE_KEY } from '../decorators/allow-pending-password-change.decorator.js';
import { AppException } from '../exceptions/app.exception.js';

import type { AuthenticatedRequest } from '../auth/request-user.types.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Access token'da `mcp = true` bo'lsa, faqat `@AllowPendingPasswordChange()` bilan belgilangan
 * endpointlar ishlaydi, qolganlari — 403 `PASSWORD_CHANGE_REQUIRED` (docs/02 §3).
 * Global guard: `JwtAuthGuard` dan keyin, `RolesGuard` dan oldin.
 */
@Injectable()
export class PasswordChangeRequiredGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user?.mustChangePassword) {
      return true;
    }
    const allowed = this.reflector.getAllAndOverride<boolean | undefined>(
      ALLOW_PENDING_PASSWORD_CHANGE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowed) {
      return true;
    }
    throw new AppException({ code: ErrorCode.PASSWORD_CHANGE_REQUIRED });
  }
}
