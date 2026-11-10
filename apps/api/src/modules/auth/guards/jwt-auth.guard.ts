import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@lms/shared';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import { AccessTokenService } from '../services/access-token.service.js';
import { TokenVersionService } from '../services/token-version.service.js';

import type { AuthenticatedRequest } from '../../../common/auth/request-user.types.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

const BEARER_PATTERN = /^Bearer ([^\s]+)$/i;

function extractBearerToken(header: string | undefined): string | null {
  return header ? (BEARER_PATTERN.exec(header)?.[1] ?? null) : null;
}

/**
 * Global autentifikatsiya guard'i (docs/01 §3.2): `@Public()` bo'lmagan har bir endpoint uchun
 * `Authorization: Bearer <access>` tekshiriladi, so'ng `ver` joriy `token_version` bilan
 * solishtiriladi (parol tiklash/deaktivatsiyadan keyin eski tokenlar ishlamaydi).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokenService,
    private readonly tokenVersions: TokenVersionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.get('authorization'));
    if (!token) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    const payload = await this.accessTokens.verify(token);
    if ((await this.tokenVersions.current(payload.sub)) !== payload.ver) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    request.user = { id: payload.sub, role: payload.role, mustChangePassword: payload.mcp };
    return true;
  }

  private isPublic(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    );
  }
}
