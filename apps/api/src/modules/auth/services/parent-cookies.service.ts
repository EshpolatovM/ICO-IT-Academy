import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { PARENT_EXCHANGE_MAX_TOKENS, parentTokenSchema } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { AesGcmCipher } from '../../../common/security/aes-gcm-cipher.js';
import {
  MS_PER_SECOND,
  PARENT_SESSION_COOKIE_NAME,
  PARENT_SESSION_COOKIE_PATH,
  PARENT_TOKENS_COOKIE_NAME,
  PARENT_TOKENS_COOKIE_PATH,
} from '../auth.constants.js';

import type { IssuedParentSession } from '../types/auth.types.js';
import type { CookieOptions, Response } from 'express';

const storedTokensSchema = z.array(parentTokenSchema).max(PARENT_EXCHANGE_MAX_TOKENS);

/**
 * Ota-ona cookie'lari (docs/02 §5.1, docs/12 §1), ikkalasi `HttpOnly; SameSite=Strict; Secure=COOKIE_SECURE`:
 * - `ps` — parent session JWT (`Path=/api/v1`, muddati sessiya bilan bir xil);
 * - `parent_tokens` — xom tokenlar ro'yxati AES-256-GCM bilan shifrlangan
 *   (`Path=/api/v1/auth/parent`, `Max-Age` — S-16). Buzilgan/eski qiymat — bo'sh ro'yxat.
 */
@Injectable()
export class ParentCookiesService {
  private readonly cipher: AesGcmCipher;

  constructor(private readonly config: AppConfigService) {
    this.cipher = new AesGcmCipher(Buffer.from(config.get('PARENT_COOKIE_KEY'), 'base64'));
  }

  setSession(response: Response, session: IssuedParentSession): void {
    response.cookie(PARENT_SESSION_COOKIE_NAME, session.token, {
      ...this.baseOptions(PARENT_SESSION_COOKIE_PATH),
      expires: session.expiresAt,
    });
  }

  /** `parent_tokens` cookie qiymatidan xom tokenlar; yo'q, buzilgan yoki eski — bo'sh ro'yxat. */
  decodeStoredTokens(encrypted: string | undefined): string[] {
    const json = encrypted ? this.cipher.decrypt(encrypted, PARENT_TOKENS_COOKIE_NAME) : null;
    if (json === null) {
      return [];
    }
    try {
      const parsed = storedTokensSchema.safeParse(JSON.parse(json));
      return parsed.success ? parsed.data : [];
    } catch (_error) {
      return [];
    }
  }

  setStoredTokens(response: Response, tokens: readonly string[]): void {
    const encrypted = this.cipher.encrypt(JSON.stringify(tokens), PARENT_TOKENS_COOKIE_NAME);
    response.cookie(PARENT_TOKENS_COOKIE_NAME, encrypted, {
      ...this.baseOptions(PARENT_TOKENS_COOKIE_PATH),
      maxAge: this.config.get('PARENT_TOKENS_COOKIE_MAX_AGE_SECONDS') * MS_PER_SECOND,
    });
  }

  /** "Chiqish" va yaroqsiz tokenlar: ikkala cookie ham o'chiriladi (docs/02 §5.1). */
  clearAll(response: Response): void {
    response.clearCookie(PARENT_SESSION_COOKIE_NAME, this.baseOptions(PARENT_SESSION_COOKIE_PATH));
    response.clearCookie(PARENT_TOKENS_COOKIE_NAME, this.baseOptions(PARENT_TOKENS_COOKIE_PATH));
  }

  private baseOptions(path: string): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE'),
      sameSite: 'strict',
      path,
    };
  }
}
