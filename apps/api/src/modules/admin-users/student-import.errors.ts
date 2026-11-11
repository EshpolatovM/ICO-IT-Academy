import { ErrorCode } from '@lms/shared';
import type { ImportRowError } from '@lms/shared';

import { AppException } from '../../common/exceptions/app.exception.js';

/** Butun faylga oid xatoning qator raqami (docs/12 §2: `row: 0`). */
export const FILE_ROW = 0;
/** Sarlavha — fayldagi birinchi qator. */
export const HEADER_ROW = 1;
export const FILE_FIELD = 'file';

/** Import validatsiyasi xatosi — hech narsa yaratilmaydi, `details[]` da qator raqamlari (S-21). */
export function importValidationException(details: ImportRowError[]): AppException {
  return new AppException({
    code: ErrorCode.VALIDATION_ERROR,
    message: 'CSV faylda xatolar bor — hech bir student yaratilmadi',
    details,
  });
}

export function fileError(message: string): AppException {
  return importValidationException([{ row: FILE_ROW, field: FILE_FIELD, message }]);
}
