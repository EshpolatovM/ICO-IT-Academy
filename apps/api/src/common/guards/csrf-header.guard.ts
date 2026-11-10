import { Injectable } from '@nestjs/common';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, ErrorCode } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';

import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Cookie bilan ishlaydigan endpointlar uchun CSRF himoyasi (docs/02 §6, docs/13 §8):
 * `X-Requested-With: XMLHttpRequest` sarlavhasi bo'lmasa — 403. Boshqa saytdan oddiy forma
 * bu sarlavhani qo'ya olmaydi, `fetch` esa CORS preflight'dan o'tishi kerak bo'ladi.
 */
@Injectable()
export class CsrfHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.get(CSRF_HEADER_NAME) !== CSRF_HEADER_VALUE) {
      throw new AppException({ code: ErrorCode.FORBIDDEN });
    }
    return true;
  }
}
