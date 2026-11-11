import { Module } from '@nestjs/common';

import { AuditLogsRepository } from './repositories/audit-logs.repository.js';
import { AuditService } from './services/audit.service.js';

/** Audit jurnali (docs/01 §4). Mutatsiya qiluvchi modullar `AuditService` ni import qiladi. */
@Module({
  providers: [AuditLogsRepository, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
