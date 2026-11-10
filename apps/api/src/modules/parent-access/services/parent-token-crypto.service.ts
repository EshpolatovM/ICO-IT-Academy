import { createHmac, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { PARENT_TOKEN_BYTES, PARENT_TOKEN_PREFIX_LENGTH } from '../parent-access.constants.js';

import type { GeneratedParentToken } from '../parent-access.types.js';

/**
 * Ota-ona tokeni kriptografiyasi (docs/02 §5): `randomBytes(32)` → base64url (43 belgi),
 * bazada — `HMAC-SHA256(PARENT_TOKEN_PEPPER, token)` (hex, 64 belgi). Entropiya yuqori,
 * shuning uchun sekin hash shart emas; HMAC indeks bo'yicha tezkor qidiruv beradi.
 */
@Injectable()
export class ParentTokenCrypto {
  constructor(private readonly config: AppConfigService) {}

  generate(): GeneratedParentToken {
    const token = randomBytes(PARENT_TOKEN_BYTES).toString('base64url');
    return {
      token,
      tokenHash: this.hash(token),
      tokenPrefix: token.slice(0, PARENT_TOKEN_PREFIX_LENGTH),
    };
  }

  hash(token: string): string {
    return createHmac('sha256', this.config.get('PARENT_TOKEN_PEPPER')).update(token).digest('hex');
  }
}
