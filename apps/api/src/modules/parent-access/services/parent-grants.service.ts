import { Injectable } from '@nestjs/common';

import { ParentAccessTokensRepository } from '../repositories/parent-access-tokens.repository.js';

import { ParentTokenCrypto } from './parent-token-crypto.service.js';
import { ParentTokenValidityCache } from './parent-token-validity.service.js';

import type { ParentAccessLogMeta, ParentGrant } from '../parent-access.types.js';

/** Xom token → amaldagi grant (token + faol student). */
export interface RawTokenGrant extends ParentGrant {
  token: string;
}

/**
 * Ota-ona kirishi uchun token tekshiruvi (auth moduli ishlatadi): xom tokenlarni HMAC bo'yicha
 * topish (exchange) va sessiyadagi token id'larining hali amaldaligini tekshirish (har so'rovda).
 */
@Injectable()
export class ParentGrantsService {
  constructor(
    private readonly tokens: ParentAccessTokensRepository,
    private readonly crypto: ParentTokenCrypto,
    private readonly validity: ParentTokenValidityCache,
  ) {}

  /**
   * Faqat amaldagi tokenlar qaytadi (bekor qilingan, muddati o'tgan, INACTIVE student — yo'q),
   * kirish tartibida.
   */
  async findByRawTokens(rawTokens: readonly string[]): Promise<RawTokenGrant[]> {
    const hashes = rawTokens.map((token) => this.crypto.hash(token));
    const rows = await this.tokens.findGrantsByHashes(hashes, new Date());
    const byHash = new Map(rows.map(({ tokenHash, ...grant }) => [tokenHash, grant]));
    return rawTokens.flatMap((token, index) => {
      const grant = byHash.get(hashes[index] ?? '');
      return grant ? [{ ...grant, token }] : [];
    });
  }

  /** Token id → student id, faqat hali amaldagilar uchun. Avval kesh, keyin baza (natija keshlanadi). */
  async activeStudentsByTokenIds(tokenIds: readonly string[]): Promise<Map<string, string>> {
    const unique = [...new Set(tokenIds)];
    const cached = await Promise.all(unique.map((tokenId) => this.validity.read(tokenId)));
    const active = new Map<string, string>();
    const misses: string[] = [];
    unique.forEach((tokenId, index) => {
      const studentId = cached[index];
      if (studentId) {
        active.set(tokenId, studentId);
      } else {
        misses.push(tokenId);
      }
    });
    if (misses.length > 0) {
      const grants = await this.tokens.findGrantsByIds(misses, new Date());
      await Promise.all(
        grants.map((grant) => this.validity.remember(grant.tokenId, grant.studentId)),
      );
      grants.forEach((grant) => active.set(grant.tokenId, grant.studentId));
    }
    return active;
  }

  recordExchange(grants: readonly ParentGrant[], meta: ParentAccessLogMeta): Promise<void> {
    return this.tokens.recordExchange(grants, meta, new Date());
  }
}
