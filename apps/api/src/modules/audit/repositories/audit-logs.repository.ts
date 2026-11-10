import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';
import type { AuditLogData, AuditSnapshot } from '../audit.types.js';

function toJson(snapshot: AuditSnapshot | null): Prisma.InputJsonValue | undefined {
  return snapshot === null ? undefined : (snapshot as Prisma.InputJsonObject);
}

/** `audit_logs` jadvali — faqat qo'shish (o'qish `GET /super/audit-logs` bilan keyinroq). */
@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insert(data: AuditLogData): Promise<void> {
    await this.prisma.db.auditLog.create({
      data: {
        actorId: data.actorId,
        actorRole: data.actorRole,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        before: toJson(data.before),
        after: toJson(data.after),
        ip: data.ip,
      },
      select: { id: true },
    });
  }
}
