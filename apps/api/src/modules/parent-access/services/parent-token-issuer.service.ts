import { Injectable } from '@nestjs/common';

import { buildParentLink } from '@lms/shared';
import type { ParentTokenCreatedResponse } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';

import { ParentTokenCrypto } from './parent-token-crypto.service.js';

import type { GeneratedParentToken, ParentTokenRecord } from '../parent-access.types.js';

/**
 * Token berish qoidalari: yangi xom token, faol tokenlar limiti (S-17) va bir martalik javob
 * (`${WEB_BASE_URL}/parent#t=<token>` havolasi bilan, docs/02 §4.4, docs/12 §2). Token fragmentda —
 * serverga yuborilmaydi va access loglarga tushmaydi (S-70); havola `@lms/shared` dagi umumiy
 * `buildParentLink` bilan yasaladi (front `parseParentLinkFragment` bilan o'qiydi).
 */
@Injectable()
export class ParentTokenIssuer {
  constructor(
    private readonly crypto: ParentTokenCrypto,
    private readonly config: AppConfigService,
  ) {}

  generate(): GeneratedParentToken {
    return this.crypto.generate();
  }

  /** Hozir env'dan; 5-bosqichda `SettingsService` (admin sozlamalari) dan olinadi. */
  get maxActiveTokens(): number {
    return this.config.get('PARENT_MAX_ACTIVE_TOKENS');
  }

  toCreatedResponse(record: ParentTokenRecord, token: string): ParentTokenCreatedResponse {
    return {
      id: record.id,
      token,
      link: buildParentLink(this.config.get('WEB_BASE_URL'), token),
      prefix: record.tokenPrefix,
      label: record.label,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
