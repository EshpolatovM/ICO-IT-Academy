import { ErrorCode } from '@lms/shared';
import type { ReviewRequiredDetails } from '@lms/shared';

import { AppException } from '../../common/exceptions/app.exception.js';

import { CONTENT_LOCKED_MESSAGE } from './learning.constants.js';

/** Ko'rinmaydigan (nashr qilinmagan, boshqa yo'ldagi, mavjud bo'lmagan) resurs — 404 (docs/12 §0). */
export function learningNotFound(): AppException {
  return new AppException({ code: ErrorCode.NOT_FOUND });
}

/** Ko'rinadigan, lekin qulflangan mavzu yoki dars — 403 `LOCKED` (3.3 §4.4). */
export function contentLocked(): AppException {
  return new AppException({ code: ErrorCode.LOCKED, message: CONTENT_LOCKED_MESSAGE });
}

/** Yangi dars takrorlash bajarilmaguncha boshlanmaydi — 409 (docs/05 §2.3, 6-modulda yoqiladi). */
export function reviewRequired(details: ReviewRequiredDetails): AppException {
  return new AppException({ code: ErrorCode.REVIEW_REQUIRED, details });
}
