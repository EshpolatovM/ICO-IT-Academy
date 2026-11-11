import type { AccountRole, AuditAction, AuditEntityType } from '@lms/shared';

/** JSON ko'rinishidagi holat (`before`/`after`). */
export type AuditSnapshot = Readonly<Record<string, unknown>>;

/** Audit yozuvi uchun kirish (docs/11 §1 `audit_logs`). */
export interface AuditEntry {
  actor: { id: string; role: AccountRole } | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: AuditSnapshot | null;
  after?: AuditSnapshot | null;
  ip: string | null;
}

/** Repository'ga yoziladigan (tozalangan) yozuv. */
export interface AuditLogData {
  actorId: string | null;
  actorRole: AccountRole | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before: AuditSnapshot | null;
  after: AuditSnapshot | null;
  ip: string | null;
}
