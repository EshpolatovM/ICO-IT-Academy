import { ContentStatus, Role } from '@lms/shared';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { PathRecord } from '../content.types.js';
import type { ContentKit } from '../services/content-kit.service.js';
import type { ContentChange } from '../services/content-transaction.service.js';

/** Unit testlar uchun umumiy soxta obyektlar (content moduli). */

export const ACTOR: ActorContext = {
  user: { id: 'a1', role: Role.ADMIN, mustChangePassword: false },
  meta: { ip: '127.0.0.1', userAgent: 'jest' },
};

export const CREATED_AT = new Date('2026-11-13T08:00:00.000Z');
export const UPDATED_AT = new Date('2026-11-13T09:00:00.000Z');

export function pathRecord(overrides: Partial<PathRecord> = {}): PathRecord {
  return {
    id: 'p1',
    title: 'Frontend',
    slug: 'frontend',
    description: null,
    status: ContentStatus.DRAFT,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    groupsCount: 0,
    ...overrides,
  };
}

/**
 * `ContentKit`: tranzaksiya — `work` darhol bajariladi, u qaytargan `changedPathIds` `bumped` ga
 * yoziladi (haqiqiy `ContentTransaction` ularni commit'dan keyin oshiradi); audit va progress — mock.
 */
export function fakeKit() {
  const bumped = jest.fn();
  const transaction = {
    commit: jest.fn(async <T>(work: () => Promise<ContentChange<T>>) => {
      const { result, changedPathIds } = await work();
      bumped(changedPathIds);
      return result;
    }),
  };
  const auditor = {
    record: jest.fn().mockResolvedValue(undefined),
    recordPatch: jest.fn().mockResolvedValue(undefined),
    recordStatus: jest.fn().mockResolvedValue(undefined),
  };
  const progress = {
    hasProgress: jest.fn().mockResolvedValue(false),
    pathUsage: jest.fn().mockResolvedValue({ groupsCount: 0, inUse: false }),
  };
  const kit = { transaction, auditor, progress } as unknown as ContentKit;
  return { kit, bumped, auditor, progress };
}
