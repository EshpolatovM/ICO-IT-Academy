import { Injectable } from '@nestjs/common';

import { AuditLogsRepository } from '../repositories/audit-logs.repository.js';

import type { AuditEntry, AuditSnapshot } from '../audit.types.js';

/**
 * Maxfiy maydonlar — `before`/`after` ga HECH QACHON yozilmaydi (har qanday chuqurlikda).
 * Taqqoslash kichik harfda va `_`/`-` siz: parol maydonlari aniq nomi bo'yicha
 * (`mustChangePassword` kabi bayroqlar qoladi), qolganlari qo'shimchasi bo'yicha
 * (`password_hash`, `tokenHash`, `refreshToken`, `PARENT_TOKEN_PEPPER`, ...).
 */
const SECRET_KEYS: ReadonlySet<string> = new Set([
  'password',
  'oldpassword',
  'newpassword',
  'temporarypassword',
]);
const SECRET_KEY_SUFFIXES = ['hash', 'token', 'tokens', 'secret', 'pepper', 'key', 'cookie'];
const KEY_SEPARATORS = /[_-]/g;

function isSecretKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(KEY_SEPARATORS, '');
  return (
    SECRET_KEYS.has(normalized) || SECRET_KEY_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
  );
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return sanitizeSnapshot(value as AuditSnapshot);
  }
  return value;
}

function sanitizeSnapshot(snapshot: AuditSnapshot): AuditSnapshot {
  return Object.fromEntries(
    Object.entries(snapshot)
      .filter(([key]) => !isSecretKey(key))
      .map(([key, value]) => [key, sanitizeValue(value)]),
  );
}

/**
 * Muhim amallar jurnali (docs/01 §4, docs/11 §1 `audit_logs`): kim (`actor`, `actorRole`),
 * nima (`action`), qaysi obyekt, oldin/keyin holati va IP. Maxfiy qiymatlar avtomatik olib tashlanadi.
 */
@Injectable()
export class AuditService {
  constructor(private readonly logs: AuditLogsRepository) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.logs.insert({
      actorId: entry.actor?.id ?? null,
      actorRole: entry.actor?.role ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      before: entry.before ? sanitizeSnapshot(entry.before) : null,
      after: entry.after ? sanitizeSnapshot(entry.after) : null,
      ip: entry.ip,
    });
  }
}
