import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode, Role } from '@lms/shared';

import { PARENT_WRITE_ALLOWED_KEY } from '../decorators/parent-write-allowed.decorator.js';
import { AppException } from '../exceptions/app.exception.js';

import type { AuthenticatedRequest } from '../auth/request-user.types.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/** Ota-ona uchun ruxsat etilgan "faqat o'qish" HTTP metodlari. */
const READ_ONLY_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD']);

/**
 * Ota-ona sessiyasi faqat o'qiy oladi (docs/01 §3.3, docs/02 §5): GET/HEAD dan boshqa har qanday
 * metod — 403, `@ParentWriteAllowed()` bilan belgilangan auth endpointlaridan tashqari.
 * Global guard: `RolesGuard` dan keyin. Boshqa rollarga ta'sir qilmaydi.
 */
@Injectable()
export class ParentReadOnlyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user?.role !== Role.PARENT || READ_ONLY_METHODS.has(request.method)) {
      return true;
    }
    const allowed = this.reflector.getAllAndOverride<boolean | undefined>(
      PARENT_WRITE_ALLOWED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowed) {
      return true;
    }
    throw new AppException({ code: ErrorCode.FORBIDDEN });
  }
}
