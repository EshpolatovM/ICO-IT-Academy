import { ErrorCode } from '@lms/shared';

import { isApiError } from '@/lib/api';

import { applyApiError } from './apply-api-error';

import type { ServerFieldMap } from './apply-api-error';
import type { FieldValues, UseFormSetError } from 'react-hook-form';

/** 409 `CONFLICT` dagi band maydon: `details: { field }` (docs/12 §0, B-1 kelishuvi). */
export function conflictField(error: unknown): string | undefined {
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
 * Forma server xatosi: 409 `CONFLICT` `details.field` (telefon band, slug band ...) — shu maydonga;
 * qolgani (400 maydon xatolari, 403, tarmoq) — `applyApiError`.
 */
export function applyFormError<T extends FieldValues>(
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
