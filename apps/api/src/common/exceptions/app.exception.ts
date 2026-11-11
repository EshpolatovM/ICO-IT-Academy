import { ErrorCode } from '@lms/shared';
import type { ApiErrorBody } from '@lms/shared';

import {
  DEFAULT_ERROR_MESSAGES,
  ERROR_HTTP_STATUS,
  HTTP_STATUS_ERROR_CODE,
  MIN_SERVER_ERROR_STATUS,
} from './error-defaults.constants.js';

export interface AppExceptionOptions {
  code: ErrorCode;
  /** Berilmasa — kod uchun standart matn. */
  message?: string;
  details?: unknown;
  /** Berilmasa — kod uchun standart HTTP holati. */
  status?: number;
  cause?: unknown;
}

/**
 * Domen xatolari uchun bazaviy class. Global exception filter uni docs/12 §0 formatiga
 * (`{ error: { code, message, details } }`) aylantiradi.
 */
export class AppException extends Error {
  override readonly name = 'AppException';
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: unknown;

  constructor(options: AppExceptionOptions) {
    super(options.message ?? DEFAULT_ERROR_MESSAGES[options.code], { cause: options.cause });
    this.code = options.code;
    this.status = options.status ?? ERROR_HTTP_STATUS[options.code];
    this.details = options.details ?? null;
  }

  /** HTTP holatidan (masalan Nest'ning `NotFoundException`) xato yasaydi — standart matn bilan. */
  static fromHttpStatus(status: number): AppException {
    const fallback =
      status >= MIN_SERVER_ERROR_STATUS ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST;
    return new AppException({ code: HTTP_STATUS_ERROR_CODE[status] ?? fallback, status });
  }

  get isServerError(): boolean {
    return this.status >= MIN_SERVER_ERROR_STATUS;
  }

  toBody(): ApiErrorBody {
    return { error: { code: this.code, message: this.message, details: this.details } };
  }
}
