import { Injectable } from '@nestjs/common';

import { PARENT_LINK_PATH, PARENT_LINK_TOKEN_PARAM } from '@lms/shared';
import type { ParentTokenCreatedResponse } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';

import { ParentTokenCrypto } from './parent-token-crypto.service.js';

import type { GeneratedParentToken, ParentTokenRecord } from '../parent-access.types.js';

/**
 * Token berish qoidalari: yangi xom token, faol tokenlar limiti (S-17) va bir martalik javob
 * (`${WEB_BASE_URL}/parent?t=<token>` havolasi bilan, docs/02 §4.4, docs/12 §2).
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
    const query = new URLSearchParams({ [PARENT_LINK_TOKEN_PARAM]: token });
    return {
      id: record.id,
      token,
      link: `${this.config.get('WEB_BASE_URL')}${PARENT_LINK_PATH}?${query.toString()}`,
      prefix: record.tokenPrefix,
      label: record.label,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
