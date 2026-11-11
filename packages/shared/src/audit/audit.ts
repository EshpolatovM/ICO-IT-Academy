/**
 * Audit amallari kodlari (docs/11 §1 `audit_logs.action`, docs/01 §4). Yangi amal shu yerga qo'shiladi.
 */
export const AuditAction = {
  PASSWORD_RESET: 'PASSWORD_RESET',
  PARENT_TOKEN_CREATED: 'PARENT_TOKEN_CREATED',
  PARENT_TOKEN_REVOKED: 'PARENT_TOKEN_REVOKED',
  PARENT_TOKEN_REGENERATED: 'PARENT_TOKEN_REGENERATED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  STUDENTS_IMPORTED: 'STUDENTS_IMPORTED',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

/** `audit_logs.entity_type` qiymatlari. */
export const AuditEntityType = {
  USER: 'USER',
  PARENT_ACCESS_TOKEN: 'PARENT_ACCESS_TOKEN',
  /** CSV import partiyasi (`entity_id` — partiya id'si, docs/12 §2). */
  STUDENT_IMPORT: 'STUDENT_IMPORT',
} as const;

export type AuditEntityType = (typeof AuditEntityType)[keyof typeof AuditEntityType];
