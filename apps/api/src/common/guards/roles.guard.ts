import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@lms/shared';
import type { Role } from '@lms/shared';

import { ANY_AUTHENTICATED_KEY } from '../decorators/any-authenticated.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { AppException } from '../exceptions/app.exception.js';

import type { AuthenticatedRequest } from '../auth/request-user.types.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Rol tekshiruvi (docs/01 §3.2), **deny-by-default** (docs/13 §8):
 * - `@Public()` — o'tkaziladi (autentifikatsiya ham talab qilinmaydi);
 * - `@Roles(...)` — foydalanuvchi roli ro'yxatda bo'lmasa — 403;
 * - `@AnyAuthenticated()` — har qanday autentifikatsiyalangan foydalanuvchi;
 * - hech biri yo'q — 403 (yangi endpointda rol unutilsa, u yopiq qoladi).
 * Global guard: `JwtAuthGuard` dan keyin ishlaydi.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.flag(context, IS_PUBLIC_KEY)) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const roles = this.reflector.getAllAndOverride<readonly Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const allowed = roles
      ? user !== undefined && roles.includes(user.role)
      : user !== undefined && this.flag(context, ANY_AUTHENTICATED_KEY);
    if (!allowed) {
      throw new AppException({ code: ErrorCode.FORBIDDEN });
    }
    return true;
  }

  private flag(context: ExecutionContext, key: string): boolean {
    return (
      this.reflector.getAllAndOverride<boolean | undefined>(key, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    );
  }
}
