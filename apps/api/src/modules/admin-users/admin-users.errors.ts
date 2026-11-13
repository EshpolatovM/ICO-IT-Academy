import { ErrorCode } from '@lms/shared';
import type { ConflictFieldDetails } from '@lms/shared';

import { AppException } from '../../common/exceptions/app.exception.js';

/** Telefon boshqa akkauntda band (unique `uq_users_phone`) — 409, `details.field = "phone"`. */
export function phoneTakenException(): AppException {
  const details: ConflictFieldDetails = { field: 'phone' };
  return new AppException({
    code: ErrorCode.CONFLICT,
    message: 'Bu telefon raqam boshqa akkauntda band',
    details,
  });
}

/** Boshqaruv endpointi orqali o'z akkauntini o'zgartirish/deaktivatsiya qilish taqiqlangan — 403. */
export function selfManagementException(): AppException {
  return new AppException({
    code: ErrorCode.FORBIDDEN,
    message: "O'z akkauntingizni bu yerda o'zgartirib yoki deaktivatsiya qilib bo'lmaydi",
  });
}
