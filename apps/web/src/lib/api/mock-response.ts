import { ErrorCode } from '@lms/shared';

import { ApiError } from './api-error';
import { HttpStatus } from './api.constants';

/*
 * Soxta (mock) API implementatsiyalari uchun umumiy yordamchilar: backend tayyor bo'lguncha
 * feature'lar xotiradagi ma'lumot bilan ishlaydi, xatolar esa haqiqiy kontraktdagidek `ApiError`.
 */

const NOT_FOUND_MESSAGE = 'Topilmadi';

/** Sinxron hisobni Promise'ga o'raydi: xato — rad etilgan Promise (haqiqiy API kabi). */
export function mockRespond<T>(compute: () => T): Promise<T> {
  try {
    return Promise.resolve(structuredClone(compute()));
  } catch (error) {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
}

/** 404 `NOT_FOUND`. */
export function mockNotFound(): ApiError {
  return new ApiError({
    status: HttpStatus.NOT_FOUND,
    code: ErrorCode.NOT_FOUND,
    message: NOT_FOUND_MESSAGE,
  });
}

/** 400 `VALIDATION_ERROR` bitta maydon xatosi bilan (`details[]`). */
export function mockValidationError(field: string, message: string): ApiError {
  return new ApiError({
    status: HttpStatus.BAD_REQUEST,
    code: ErrorCode.VALIDATION_ERROR,
    message,
    details: [{ field, message }],
  });
}

/** 409 `CONFLICT` (`details` — kontraktdagi obyekt: `{ field }` yoki `{ reason, ... }`). */
export function mockConflict(message: string, details: Record<string, unknown>): ApiError {
  return new ApiError({ status: HttpStatus.CONFLICT, code: ErrorCode.CONFLICT, message, details });
}
