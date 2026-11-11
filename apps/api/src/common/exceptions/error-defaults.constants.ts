import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

/** 5xx chegarasi: shundan boshlab xato ichki hisoblanadi (logga yoziladi, tafsilot chiqmaydi). */
export const MIN_SERVER_ERROR_STATUS: number = HttpStatus.INTERNAL_SERVER_ERROR;
/** 4xx chegarasi. */
export const MIN_CLIENT_ERROR_STATUS: number = HttpStatus.BAD_REQUEST;

/** Har bir xato kodi uchun HTTP holati (docs/12-api.md §0). */
export const ERROR_HTTP_STATUS: Readonly<Record<ErrorCode, HttpStatus>> = {
  [ErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [ErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.REFRESH_SUPERSEDED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [ErrorCode.PAYLOAD_TOO_LARGE]: HttpStatus.PAYLOAD_TOO_LARGE,
  [ErrorCode.RATE_LIMITED]: HttpStatus.TOO_MANY_REQUESTS,
  [ErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.PASSWORD_CHANGE_REQUIRED]: HttpStatus.FORBIDDEN,
  [ErrorCode.LOCKED]: HttpStatus.FORBIDDEN,
  [ErrorCode.REVIEW_REQUIRED]: HttpStatus.CONFLICT,
  [ErrorCode.INSUFFICIENT_COINS]: HttpStatus.CONFLICT,
  [ErrorCode.OUT_OF_STOCK]: HttpStatus.CONFLICT,
  [ErrorCode.ALREADY_DONE]: HttpStatus.CONFLICT,
  [ErrorCode.STUDENT_ALREADY_IN_GROUP]: HttpStatus.CONFLICT,
};

/** Xabar berilmaganda ishlatiladigan standart matnlar. */
export const DEFAULT_ERROR_MESSAGES: Readonly<Record<ErrorCode, string>> = {
  [ErrorCode.VALIDATION_ERROR]: "So'rov ma'lumotlari noto'g'ri",
  [ErrorCode.BAD_REQUEST]: "Noto'g'ri so'rov",
  [ErrorCode.UNAUTHORIZED]: 'Avtorizatsiya talab qilinadi',
  [ErrorCode.REFRESH_SUPERSEDED]: "Sessiya boshqa so'rovda yangilangan, qayta urinib ko'ring",
  [ErrorCode.FORBIDDEN]: "Ruxsat yo'q",
  [ErrorCode.NOT_FOUND]: 'Topilmadi',
  [ErrorCode.CONFLICT]: 'Ziddiyat: resurs allaqachon mavjud yoki holati mos emas',
  [ErrorCode.PAYLOAD_TOO_LARGE]: 'Fayl hajmi ruxsat etilganidan katta',
  [ErrorCode.RATE_LIMITED]: "So'rovlar juda ko'p, birozdan keyin urinib ko'ring",
  [ErrorCode.INTERNAL_ERROR]: 'Ichki server xatosi',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Servis vaqtincha ishlamayapti',
  [ErrorCode.PASSWORD_CHANGE_REQUIRED]: 'Avval parolni almashtiring',
  [ErrorCode.LOCKED]: 'Akkaunt vaqtincha bloklangan',
  [ErrorCode.REVIEW_REQUIRED]: 'Avval takrorlashlarni bajaring',
  [ErrorCode.INSUFFICIENT_COINS]: 'Coin yetarli emas',
  [ErrorCode.OUT_OF_STOCK]: 'Mahsulot qolmagan',
  [ErrorCode.ALREADY_DONE]: 'Allaqachon bajarilgan',
  [ErrorCode.STUDENT_ALREADY_IN_GROUP]: 'Student allaqachon boshqa faol guruhda',
};

/** `HttpException` holatidan xato kodini aniqlash (Nest'ning o'z xatolari, masalan route topilmasa). */
export const HTTP_STATUS_ERROR_CODE: Readonly<Partial<Record<number, ErrorCode>>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMITED,
  [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
};
