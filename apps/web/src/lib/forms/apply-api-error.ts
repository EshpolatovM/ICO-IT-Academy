import { ErrorCode } from '@lms/shared';

import { isApiError, UNKNOWN_ERROR_MESSAGE } from '@/lib/api';

import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/** Formaning umumiy (maydonga bog'lanmagan) server xatosi kaliti: `errors.root.server`. */
export const SERVER_ERROR_KEY = 'root.server' as const;

/** Server maydon nomi (`details[].field`) → forma maydoni. */
export type ServerFieldMap<T extends FieldValues> = Readonly<Partial<Record<string, Path<T>>>>;

/**
 * Server xatosini formaga o'tkazadi (docs/12 §0):
 * - `VALIDATION_ERROR` — `details[]` dagi har bir ma'lum maydon o'z xatosini oladi;
 * - qolgani (401 umumiy xabar, 429, 5xx, tarmoq) — server xabari formaning umumiy xatosi sifatida.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: ServerFieldMap<T>,
): void {
  if (isApiError(error) && error.code === ErrorCode.VALIDATION_ERROR) {
    const fieldErrors = error.fieldErrors.flatMap((detail) => {
      const field = fieldMap[detail.field];
      return field === undefined ? [] : [{ field, message: detail.message }];
    });
    fieldErrors.forEach(({ field, message }) => {
      setError(field, { type: 'server', message });
    });
    if (fieldErrors.length > 0) {
      return;
    }
  }
  const message = isApiError(error) ? error.message : UNKNOWN_ERROR_MESSAGE;
  setError(SERVER_ERROR_KEY, { type: 'server', message });
}
