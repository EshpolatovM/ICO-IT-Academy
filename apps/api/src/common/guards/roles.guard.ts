import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@lms/shared';
import type { Role } from '@lms/shared';

import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { AppException } from '../exceptions/app.exception.js';

import type { AuthenticatedRequest } from '../auth/request-user.types.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * `@Roles(...)` bilan belgilangan endpointda foydalanuvchi roli ro'yxatda bo'lmasa — 403 (docs/01 §3.2).
 * `@Roles` berilmagan endpointlar — har qanday autentifikatsiyalangan foydalanuvchi uchun.
 * Global guard: `JwtAuthGuard` dan keyin ishlaydi.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<readonly Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !roles.includes(user.role)) {
      throw new AppException({ code: ErrorCode.FORBIDDEN });
    }
    return true;
  }
}
