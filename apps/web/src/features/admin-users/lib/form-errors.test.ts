import { describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ApiError } from '@/lib/api';

import { changedFields } from './changed-fields';
import { importRowErrors } from './import-errors';
import { applyUserFormError } from './user-form-error';

const FIELDS = { phone: 'phone', firstName: 'firstName' } as const;

function apiError(status: number, code: ErrorCode, details: unknown = null): ApiError {
  return new ApiError({ status, code, message: 'Server xabari', details });
}

describe('applyUserFormError', () => {
  it('409 CONFLICT details.field=phone → telefon maydoniga', () => {
    const setError = vi.fn();
    applyUserFormError(apiError(409, ErrorCode.CONFLICT, { field: 'phone' }), setError, FIELDS);
    expect(setError).toHaveBeenCalledWith('phone', { type: 'server', message: 'Server xabari' });
  });

  it('400 VALIDATION_ERROR details[] → maydonlarga', () => {
    const setError = vi.fn();
    const details = [{ field: 'firstName', message: "Bo'sh" }];
    applyUserFormError(apiError(400, ErrorCode.VALIDATION_ERROR, details), setError, FIELDS);
    expect(setError).toHaveBeenCalledWith('firstName', { type: 'server', message: "Bo'sh" });
  });

  it("403 (o'z akkaunti) va maydonsiz 409 — umumiy xato", () => {
    const setError = vi.fn();
    applyUserFormError(apiError(403, ErrorCode.FORBIDDEN), setError, FIELDS);
    applyUserFormError(apiError(409, ErrorCode.CONFLICT, { field: 'other' }), setError, FIELDS);
    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenNthCalledWith(1, 'root.server', {
      type: 'server',
      message: 'Server xabari',
    });
  });
});

describe('importRowErrors', () => {
  it('VALIDATION_ERROR dagi {row, field, message} larni ajratadi', () => {
    const rows = [
      { row: 3, field: 'lastName', message: 'Majburiy' },
      { field: 'x', message: "row yo'q" },
    ];
    expect(importRowErrors(apiError(400, ErrorCode.VALIDATION_ERROR, rows))).toEqual([rows[0]]);
  });

  it("boshqa xatolarda — bo'sh", () => {
    expect(importRowErrors(apiError(413, ErrorCode.PAYLOAD_TOO_LARGE))).toEqual([]);
    expect(importRowErrors(new Error('x'))).toEqual([]);
  });
});

describe('changedFields', () => {
  it("faqat o'zgarganlar", () => {
    const initial = { firstName: 'Ali', lastName: 'Valiyev' };
    expect(changedFields({ firstName: 'Ali', lastName: 'Karimov' }, initial)).toEqual({
      lastName: 'Karimov',
    });
    expect(changedFields(initial, initial)).toEqual({});
  });
});
