import { ErrorCode } from '@lms/shared';

import { isApiError } from '@/lib/api';
import { applyApiError } from '@/lib/forms';
import type { ServerFieldMap } from '@/lib/forms';

import type { FieldValues, UseFormSetError } from 'react-hook-form';

function conflictField(error: unknown): string | undefined {
  if (!isApiError(error) || error.code !== ErrorCode.CONFLICT) {
    return undefined;
  }
  const { details } = error;
  if (typeof details !== 'object' || details === null || !('field' in details)) {
    return undefined;
  }
  return typeof details.field === 'string' ? details.field : undefined;
}

/**
 * Foydalanuvchi formasidagi server xatosi: 409 `CONFLICT` `details.field` (masalan telefon band) —
 * shu maydonga; qolgani (400 maydon xatolari, 403 o'z akkaunti, tarmoq) — `applyApiError`.
 */
export function applyUserFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: ServerFieldMap<T>,
): void {
  const field = conflictField(error);
  const target = field === undefined ? undefined : fieldMap[field];
  if (target !== undefined && isApiError(error)) {
    setError(target, { type: 'server', message: error.message });
    return;
  }
  applyApiError(error, setError, fieldMap);
}
