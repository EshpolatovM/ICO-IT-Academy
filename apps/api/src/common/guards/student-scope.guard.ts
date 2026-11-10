import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';
import { STUDENT_SCOPE_PARAM_KEY, STUDENT_SCOPE_RESOLVER } from '../scope/student-scope.types.js';

import type { AuthenticatedRequest } from '../auth/request-user.types.js';
import type { StudentScopeResolver } from '../scope/student-scope.types.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * `@StudentScope('param')` guard'i (docs/01 §3.2): foydalanuvchi URL'dagi studentga kira olmasa — 404.
 * Global guard'lardan (autentifikatsiya, rol) keyin ishlaydi.
 */
@Injectable()
export class StudentScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(STUDENT_SCOPE_RESOLVER) private readonly resolver: StudentScopeResolver,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const param = this.reflector.getAllAndOverride<string | undefined>(STUDENT_SCOPE_PARAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const studentId = param === undefined ? undefined : request.params[param];
    if (!request.user || typeof studentId !== 'string') {
      throw new AppException({ code: ErrorCode.FORBIDDEN });
    }
    if (!(await this.resolver.canAccess(request.user, studentId))) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
    return true;
  }
}
