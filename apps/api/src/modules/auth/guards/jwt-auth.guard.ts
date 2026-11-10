import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@lms/shared';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';
import { AppException } from '../../../common/exceptions/app.exception.js';
import { parentSessionFromRequest } from '../decorators/parent-cookies.decorator.js';
import { AccessTokenService } from '../services/access-token.service.js';
import { ParentCookiesService } from '../services/parent-cookies.service.js';
import { ParentSessionAuthenticator } from '../services/parent-session-authenticator.service.js';
import { TokenVersionService } from '../services/token-version.service.js';

import type {
  AccountRequestUser,
  AuthenticatedRequest,
} from '../../../common/auth/request-user.types.js';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Response } from 'express';

const BEARER_PATTERN = /^Bearer ([^\s]+)$/i;

function extractBearerToken(header: string | undefined): string | null {
  return header ? (BEARER_PATTERN.exec(header)?.[1] ?? null) : null;
}

/**
 * Global autentifikatsiya guard'i (docs/01 §3.2): `@Public()` bo'lmagan har bir endpoint uchun
 * 1) `Authorization: Bearer <access>` — imzo va `ver` joriy `token_version` bilan solishtiriladi;
 * 2) bo'lmasa `ps` cookie — ota-ona sessiyasi (tokenlar har so'rovda tekshiriladi, sliding).
 * Ikkalasi ham yo'q — 401.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokenService,
    private readonly tokenVersions: TokenVersionService,
    private readonly parentSessions: ParentSessionAuthenticator,
    private readonly parentCookies: ParentCookiesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublic(context)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const bearer = extractBearerToken(request.get('authorization'));
    if (bearer) {
      request.user = await this.authenticateAccount(bearer);
      return true;
    }
    const parentSession = parentSessionFromRequest(request);
    if (!parentSession) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    const { user, renewed } = await this.parentSessions.authenticate(parentSession);
    if (renewed) {
      this.parentCookies.setSession(context.switchToHttp().getResponse<Response>(), renewed);
    }
    request.user = user;
    return true;
  }

  private async authenticateAccount(token: string): Promise<AccountRequestUser> {
    const payload = await this.accessTokens.verify(token);
    if ((await this.tokenVersions.current(payload.sub)) !== payload.ver) {
      throw new AppException({ code: ErrorCode.UNAUTHORIZED });
    }
    return { id: payload.sub, role: payload.role, mustChangePassword: payload.mcp };
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
