import { ErrorCode } from '@lms/shared';
import type { FieldErrorDetail, GroupRef } from '@lms/shared';

import { AppException } from '../../common/exceptions/app.exception.js';

/** Guruh topilmadi (yoki mentor scope'idan tashqarida) — 404. */
export function groupNotFoundException(): AppException {
  return new AppException({ code: ErrorCode.NOT_FOUND });
}

/** So'rov maydonlari noto'g'ri qiymatga ishora qiladi — 400 `VALIDATION_ERROR` (`details[].field`). */
export function invalidReferencesException(details: readonly FieldErrorDetail[]): AppException {
  return new AppException({ code: ErrorCode.VALIDATION_ERROR, details: [...details] });
}

export function invalidReferenceException(field: string, message: string): AppException {
  return invalidReferencesException([{ field, message }]);
}

/**
 * Arxivlangan guruhga a'zo qo'shib bo'lmaydi — 409 `GROUP_ARCHIVED`. `groups` berilsa (CSV import:
 * guruh tekshiruvdan keyin arxivlangan) — `details.groups` da qaysilari.
 */
export function groupArchivedException(groups?: readonly GroupRef[]): AppException {
  return new AppException({
    code: ErrorCode.GROUP_ARCHIVED,
    ...(groups ? { details: { groups: [...groups] } } : {}),
  });
}

/** Studentlar boshqa faol guruhda (S-02) — 409, `details.studentIds` — qaysilari. */
export function studentsAlreadyInGroupException(studentIds: readonly string[]): AppException {
  return new AppException({
    code: ErrorCode.STUDENT_ALREADY_IN_GROUP,
    details: { studentIds: [...studentIds] },
  });
}
