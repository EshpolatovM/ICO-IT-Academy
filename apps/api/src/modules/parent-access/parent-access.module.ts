import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { UsersModule } from '../users/users.module.js';

import { ParentTokensController } from './controllers/parent-tokens.controller.js';
import { ParentAccessTokensRepository } from './repositories/parent-access-tokens.repository.js';
import { ParentAccessSuspensionService } from './services/parent-access-suspension.service.js';
import { ParentGrantsService } from './services/parent-grants.service.js';
import { ParentTokenAuditor } from './services/parent-token-auditor.service.js';
import { ParentTokenCrypto } from './services/parent-token-crypto.service.js';
import { ParentTokenIssuer } from './services/parent-token-issuer.service.js';
import { ParentTokenValidityCache } from './services/parent-token-validity.service.js';
import { ParentTokensService } from './services/parent-tokens.service.js';

/**
 * Ota-ona tokenlari (docs/02 §4.4, §5): boshqaruv endpointlari va auth moduli uchun
 * token tekshiruvi (`ParentGrantsService`), student deaktivatsiyasida sessiyalarni to'xtatish
 * (`ParentAccessSuspensionService`).
 */
@Module({
  imports: [UsersModule, AuditModule],
  controllers: [ParentTokensController],
  providers: [
    ParentAccessTokensRepository,
    ParentTokenCrypto,
    ParentTokenIssuer,
    ParentTokenAuditor,
    ParentTokenValidityCache,
    ParentTokensService,
    ParentGrantsService,
    ParentAccessSuspensionService,
  ],
  exports: [ParentGrantsService, ParentAccessSuspensionService],
})
export class ParentAccessModule {}
