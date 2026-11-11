import { GroupStatus } from '@lms/shared';

import type { GroupRecord } from '../groups.types.js';
import type { GroupAuditor } from '../services/group-auditor.service.js';
import type { GroupDetailsService } from '../services/group-details.service.js';
import type { GroupReferences } from '../services/group-references.service.js';
import type { GroupChange, GroupTransaction } from '../services/group-transaction.service.js';

/** Unit testlar uchun umumiy soxta obyektlar (groups moduli). */

export const GROUP_CREATED_AT = new Date('2026-11-01T08:00:00.000Z');

export function groupRecord(overrides: Partial<GroupRecord> = {}): GroupRecord {
  return {
    id: 'g1',
    name: 'FE-12',
    status: GroupStatus.ACTIVE,
    startsAt: new Date('2026-11-15T00:00:00.000Z'),
    createdAt: GROUP_CREATED_AT,
    path: { id: 'p1', title: 'Frontend' },
    mentor: { id: 'm1', firstName: 'Bobur', lastName: 'K' },
    membersCount: 0,
    ...overrides,
  };
}

/**
 * Tranzaksiya: `work` darhol bajariladi; u qaytargan ta'sirlangan mentorlar `affected` ga
 * yoziladi (haqiqiy `GroupTransaction` ularni commit'dan keyin invalidatsiya qiladi).
 */
export function fakeTransaction() {
  const affected = jest.fn();
  const transaction = {
    affected,
    commit: jest.fn(async <T>(work: () => Promise<GroupChange<T>>) => {
      const { result, affectedMentorIds } = await work();
      affected(affectedMentorIds);
      return result;
    }),
  };
  return { transaction, asTransaction: transaction as unknown as GroupTransaction };
}

export function fakeAuditor() {
  const auditor = { record: jest.fn().mockResolvedValue(undefined) };
  return { auditor, asAuditor: auditor as unknown as GroupAuditor };
}

export function fakeReferences() {
  const references = {
    requirePath: jest.fn().mockResolvedValue(undefined),
    requireActiveMentor: jest.fn().mockResolvedValue(undefined),
    requireStudents: jest.fn().mockResolvedValue(undefined),
  };
  return { references, asReferences: references as unknown as GroupReferences };
}

export function fakeDetails(record: GroupRecord = groupRecord()) {
  const details = {
    requireGroup: jest.fn().mockResolvedValue(record),
    requireLockedGroup: jest.fn().mockResolvedValue(record),
    detail: jest.fn().mockResolvedValue({ id: record.id, members: [] }),
  };
  return { details, asDetails: details as unknown as GroupDetailsService };
}
