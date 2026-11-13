import { describe, expect, it } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ApiError } from '@/lib/api';

import { ContentConflictReason } from '../types/admin-content.types';

import { conflictReason, contentErrorText } from './content-errors';

function conflict(details: unknown): ApiError {
  return new ApiError({ status: 409, code: ErrorCode.CONFLICT, message: 'Server matni', details });
}

describe('content-errors', () => {
  it('409 details.reason — tushunarli matn (groupsCount bilan)', () => {
    const error = conflict({ reason: ContentConflictReason.PATH_IN_USE, groupsCount: 2 });
    expect(conflictReason(error)).toBe(ContentConflictReason.PATH_IN_USE);
    expect(contentErrorText(error)).toMatch(/ishlatilmoqda.*Guruhlar soni: 2\./);
    expect(contentErrorText(conflict({ reason: ContentConflictReason.HAS_CHEST }))).toMatch(
      /sandiq bog'langan/,
    );
  });

  it("noma'lum sabab, field-conflict yoki boshqa xato — server xabari", () => {
    expect(conflictReason(conflict({ field: 'slug' }))).toBeUndefined();
    expect(contentErrorText(conflict({ reason: 'OTHER' }))).toBe('Server matni');
    expect(contentErrorText(new Error('x'))).toMatch(/Kutilmagan xato/);
  });
});
