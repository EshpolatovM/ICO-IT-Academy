import { ErrorCode } from '@lms/shared';
import type { ImportRowError } from '@lms/shared';

import { isApiError } from '@/lib/api';

function isImportRowError(value: unknown): value is ImportRowError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { row, field, message } = value as Partial<Record<keyof ImportRowError, unknown>>;
  return typeof row === 'number' && typeof field === 'string' && typeof message === 'string';
}

/** CSV import `400 VALIDATION_ERROR` javobidagi qator xatolari (boshqa xatolarda — bo'sh). */
export function importRowErrors(error: unknown): ImportRowError[] {
  if (!isApiError(error) || error.code !== ErrorCode.VALIDATION_ERROR) {
    return [];
  }
  return Array.isArray(error.details) ? error.details.filter(isImportRowError) : [];
}
