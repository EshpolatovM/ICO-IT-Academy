import { Injectable } from '@nestjs/common';

import { ErrorCode, PARENT_EXCHANGE_MAX_TOKENS } from '@lms/shared';
import type { ParentExchangeResponse } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { ParentGrantsService } from '../../parent-access/services/parent-grants.service.js';
import { INVALID_PARENT_TOKEN_MESSAGE } from '../auth.constants.js';
import { toParentChildren } from '../mappers/parent-child.mapper.js';

import { ParentCookiesService } from './parent-cookies.service.js';
import { ParentExchangeRateLimiter } from './parent-exchange-rate-limiter.service.js';
import { ParentSessionTokenService } from './parent-session-token.service.js';

import type { ClientMeta } from '../../../common/auth/request-user.types.js';
import type { RawTokenGrant } from '../../parent-access/services/parent-grants.service.js';
import type { ParentExchangeDto } from '../dto/auth.dto.js';
import type { Response } from 'express';

/** `parent_access_logs` ustunlari NOT NULL (docs/11 §1): aniqlanmagan IP/UA o'rinbosarlari. */
const UNSPECIFIED_IP = '0.0.0.0';
const UNSPECIFIED_USER_AGENT = '';

export interface ParentExchangeInput {
  dto: ParentExchangeDto;
  /** `parent_tokens` cookie'ning (shifrlangan) qiymati. */
  storedCookie: string | undefined;
  meta: ClientMeta;
  response: Response;
}

/** Takrorlanmas, tartibi saqlangan, eng yangi `PARENT_EXCHANGE_MAX_TOKENS` ta token. */
function uniqueTokens(tokens: readonly string[]): string[] {
  return [...new Set(tokens.toReversed())].slice(0, PARENT_EXCHANGE_MAX_TOKENS).toReversed();
}

/**
 * `POST /auth/parent/exchange` (docs/02 §4.5, §5.1, docs/12 §1):
 * - `tokens` berilsa: `merge=false` — faqat shular, `merge=true` — cookie'dagilarga qo'shiladi;
 * - body'siz: `parent_tokens` cookie'dagi tokenlar bilan sessiya yangilanadi.
 * Berilgan token yaroqsiz bo'lsa — 401 (umumiy xabar). Cookie'dagi yaroqsiz tokenlar jimgina
 * olib tashlanadi. Muvaffaqiyatda `ps` va `parent_tokens` qayta yoziladi, foydalanish qayd etiladi.
 */
@Injectable()
export class ParentExchangeService {
  constructor(
    private readonly grants: ParentGrantsService,
    private readonly sessionTokens: ParentSessionTokenService,
    private readonly cookies: ParentCookiesService,
    private readonly rateLimiter: ParentExchangeRateLimiter,
  ) {}

  async exchange(input: ParentExchangeInput): Promise<ParentExchangeResponse> {
    const { dto, meta, response } = input;
    await this.rateLimiter.consumeAttempt(meta.ip);
    const submitted = dto.tokens ?? [];
    const useStored = submitted.length === 0 || dto.merge;
    const stored = useStored ? this.cookies.decodeStoredTokens(input.storedCookie) : [];
    const grants = await this.grants.findByRawTokens(uniqueTokens([...stored, ...submitted]));
    const validTokens = new Set(grants.map((grant) => grant.token));
    if (grants.length === 0 || submitted.some((token) => !validTokens.has(token))) {
      if (submitted.length === 0) {
        this.cookies.clearAll(response);
      }
      await this.rateLimiter.registerFailure(meta.ip);
      throw new AppException({
        code: ErrorCode.UNAUTHORIZED,
        message: INVALID_PARENT_TOKEN_MESSAGE,
      });
    }
    await this.startSession(grants, meta, response);
    return { children: toParentChildren(grants) };
  }

  private async startSession(
    grants: readonly RawTokenGrant[],
    meta: ClientMeta,
    response: Response,
  ): Promise<void> {
    await this.grants.recordExchange(grants, {
      ip: meta.ip ?? UNSPECIFIED_IP,
      userAgent: meta.userAgent ?? UNSPECIFIED_USER_AGENT,
    });
    this.cookies.setSession(response, await this.sessionTokens.sign(grants));
    this.cookies.setStoredTokens(
      response,
      grants.map((grant) => grant.token),
    );
  }
}
