import { Injectable } from '@nestjs/common';

import { ParentAccessTokensRepository } from '../repositories/parent-access-tokens.repository.js';

import { ParentTokenValidityCache } from './parent-token-validity.service.js';

/**
 * Student deaktivatsiya/aktivatsiyasida ota-ona sessiyalarini darhol to'xtatish/tiklash (docs/02 §6).
 * Tokenlar bazada BEKOR QILINMAYDI: `ParentGrantsService` INACTIVE studentning tokenlarini baribir
 * rad etadi (baza — haqiqat manbai), faqat `parent_token:{id}:valid` keshi (TTL 300 s) ichida eski
 * "valid" qolib ketmasligi uchun tombstone qo'yiladi. Qayta aktivlashtirilganda tombstone olib
 * tashlanadi — ota-ona havolasi qayta yaratilmasdan ishlaydi.
 */
@Injectable()
export class ParentAccessSuspensionService {
  constructor(
    private readonly tokens: ParentAccessTokensRepository,
    private readonly validity: ParentTokenValidityCache,
  ) {}

  async suspendStudent(studentId: string): Promise<void> {
    const tokenIds = await this.tokens.listActiveIds(studentId, new Date());
    await Promise.all(tokenIds.map((tokenId) => this.validity.markRevoked(tokenId)));
  }

  async resumeStudent(studentId: string): Promise<void> {
    const tokenIds = await this.tokens.listActiveIds(studentId, new Date());
    await Promise.all(tokenIds.map((tokenId) => this.validity.clearRevoked(tokenId)));
  }
}
