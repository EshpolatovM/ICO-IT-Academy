import { ContentConflictReason, ErrorCode } from '@lms/shared';
import type { ConflictFieldDetails, ContentConflictDetails, FieldErrorDetail } from '@lms/shared';

import { AppException } from '../../common/exceptions/app.exception.js';

/** Kontent topilmadi — 404. */
export function contentNotFoundException(): AppException {
  return new AppException({ code: ErrorCode.NOT_FOUND });
}

/** `null` — 404, aks holda qiymatning o'zi. */
export function orNotFound<T>(value: T | null): T {
  if (value === null) {
    throw contentNotFoundException();
  }
  return value;
}

/** Unikal maydon band (slug, ko'nikma nomi) — 409, `details: { field }` (B-1). */
export function fieldTakenException(field: string, message: string): AppException {
  const details: ConflictFieldDetails = { field };
  return new AppException({ code: ErrorCode.CONFLICT, message, details });
}

/** Kontent 409 i — `details.reason` bilan (3.2 §2.4). */
export function contentConflictException(details: ContentConflictDetails): AppException {
  return new AppException({ code: ErrorCode.CONFLICT, details });
}

export const pathInUseException = (groupsCount: number) =>
  contentConflictException({ reason: ContentConflictReason.PATH_IN_USE, groupsCount });

/** Parallel o'zgarish (masalan tartiblash paytida bola o'chirildi) — 409, `details` siz. */
export function concurrentChangeException(): AppException {
  return new AppException({ code: ErrorCode.CONFLICT });
}

export const hasProgressException = () =>
  contentConflictException({ reason: ContentConflictReason.HAS_PROGRESS });

/** So'rov maydonlari noto'g'ri qiymatga ishora qiladi — 400 `VALIDATION_ERROR` (`details[]`). */
export function invalidFieldsException(details: readonly FieldErrorDetail[]): AppException {
  return new AppException({ code: ErrorCode.VALIDATION_ERROR, details: [...details] });
}

export function invalidFieldException(field: string, message: string): AppException {
  return invalidFieldsException([{ field, message }]);
}
