import { Role, UserStatus } from '@lms/shared';
import type { AccountRole } from '@lms/shared';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import type { AuditService } from '../../audit/services/audit.service.js';
import type { UserAccountRecord } from '../admin-users.types.js';

/** Unit testlar uchun umumiy soxta obyektlar (admin-users moduli). */

export const CREATED_AT = new Date('2026-11-01T08:00:00.000Z');

export function accountRecord(
  role: AccountRole,
  overrides: Partial<UserAccountRecord> = {},
): UserAccountRecord {
  const isStudent = role === Role.STUDENT;
  return {
    id: 'u1',
    role,
    phone: isStudent ? null : '+998900000001',
    studentCode: isStudent ? 'ST-10001' : null,
    firstName: 'Ali',
    lastName: 'Valiyev',
    status: UserStatus.ACTIVE,
    mustChangePassword: false,
    bio: null,
    lastLoginAt: null,
    createdAt: CREATED_AT,
    mentoredGroups: [],
    activeGroup: null,
    ...overrides,
  };
}

export function actorOf(role: AccountRole, id = 'actor'): ActorContext {
  return {
    user: { id, role, mustChangePassword: false },
    meta: { ip: '10.0.0.1', userAgent: 'jest' },
  };
}

export function fakeUnitOfWork() {
  const unitOfWork = { run: jest.fn(<T>(work: () => Promise<T>) => work()) };
  return { unitOfWork, asUnitOfWork: unitOfWork as unknown as UnitOfWork };
}

export function fakeAudit() {
  const audit = {
    record: jest.fn().mockResolvedValue(undefined),
    recordMany: jest.fn().mockResolvedValue(undefined),
  };
  return { audit, asAudit: audit as unknown as AuditService };
}

/** Soxta parol servisi: `hash(<parol>)`; vaqtinchalik parol — `Temp<n>abc`. */
export function fakePasswords() {
  let counter = 0;
  const next = () => {
    counter += 1;
    const temporaryPassword = `Temp${String(counter)}abc`;
    return { passwordHash: `hash(${temporaryPassword})`, temporaryPassword };
  };
  return {
    prepare: jest.fn((password: string | null | undefined) =>
      Promise.resolve(
        password ? { passwordHash: `hash(${password})`, temporaryPassword: null } : next(),
      ),
    ),
    generate: jest.fn(() => Promise.resolve(next())),
  };
}
