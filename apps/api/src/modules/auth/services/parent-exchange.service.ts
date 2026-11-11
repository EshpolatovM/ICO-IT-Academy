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
 * - `tokens` berilsa: `merge=false` — faqat shular, `merge=true` — cookie'dagilarga qo'shiladi.
 *   Urinish token tekshiruvidan OLDIN sanaladi; berilgan token yaroqsiz bo'lsa — 401 (umumiy xabar)
 *   va muvaffaqiyatsizlik sanaladi;
 * - body'siz: `parent_tokens` cookie'dagi tokenlar bilan sessiya yangilanadi. Cookie server kaliti
 *   bilan AES-GCM'da autentifikatsiyalangan — muvaffaqiyatli yangilash rate limitga sanalmaydi.
 *   Cookie buzilgan bo'lsa — oddiy urinish kabi (oldindan) sanaladi; tokenlarning birortasi ham
 *   amalda bo'lmasa — urinish va muvaffaqiyatsizlik sanaladi. Ikkala holda cookie'lar o'chiriladi.
 *   Cookie'dagi yaroqsiz tokenlar jimgina olib tashlanadi;
 * - body ham, `parent_tokens` cookie ham yo'q — 401, rate limit/blok hisobiga qo'shilmaydi.
 * Muvaffaqiyatda `ps` va `parent_tokens` qayta yoziladi, foydalanish qayd etiladi.
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
    const submitted = dto.tokens ?? [];
    if (submitted.length === 0) {
      return this.refreshFromCookie(input);
    }
    await this.rateLimiter.consumeAttempt(meta.ip);
    const stored = dto.merge ? this.cookies.decodeStoredTokens(input.storedCookie) : [];
    const grants = await this.grants.findByRawTokens(uniqueTokens([...stored, ...submitted]));
    const validTokens = new Set(grants.map((grant) => grant.token));
    if (submitted.some((token) => !validTokens.has(token))) {
      await this.rateLimiter.registerFailure(meta.ip);
      throw this.invalidToken();
    }
    return this.startSession(grants, meta, response);
  }

  /** Body'siz exchange: sessiyani cookie'dagi saqlangan tokenlar bilan yangilash. */
  private async refreshFromCookie(input: ParentExchangeInput): Promise<ParentExchangeResponse> {
    const { meta, response } = input;
    if (input.storedCookie === undefined) {
      // Hech qanday token yo'q — bu taxmin qilish urinishi emas: limit va blokka qo'shilmaydi.
      this.cookies.clearAll(response);
      throw this.invalidToken();
    }
    const stored = this.cookies.decodeStoredTokens(input.storedCookie);
    if (stored.length === 0) {
      // GCM tekshiruvidan o'tmagan (buzilgan/soxta) cookie — oddiy urinish kabi sanaladi.
      this.cookies.clearAll(response);
      await this.rateLimiter.consumeAttempt(meta.ip);
      await this.rateLimiter.registerFailure(meta.ip);
      throw this.invalidToken();
    }
    const grants = await this.grants.findByRawTokens(uniqueTokens(stored));
    if (grants.length === 0) {
      this.cookies.clearAll(response);
      await this.rateLimiter.registerFailedAttempt(meta.ip);
      throw this.invalidToken();
    }
    return this.startSession(grants, meta, response);
  }

  private invalidToken(): AppException {
    return new AppException({
      code: ErrorCode.UNAUTHORIZED,
      message: INVALID_PARENT_TOKEN_MESSAGE,
    });
  }

  private async startSession(
    grants: readonly RawTokenGrant[],
    meta: ClientMeta,
    response: Response,
  ): Promise<ParentExchangeResponse> {
    await this.grants.recordExchange(grants, {
      ip: meta.ip ?? UNSPECIFIED_IP,
      userAgent: meta.userAgent ?? UNSPECIFIED_USER_AGENT,
    });
    this.cookies.setSession(response, await this.sessionTokens.sign(grants));
    this.cookies.setStoredTokens(
      response,
      grants.map((grant) => grant.token),
    );
    return { children: toParentChildren(grants) };
  }
}
