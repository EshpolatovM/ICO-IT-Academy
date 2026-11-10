import { ErrorCode } from '@lms/shared';
import type { ApiErrorBody, FieldErrorDetail } from '@lms/shared';

import {
  HttpStatus,
  NETWORK_ERROR_MESSAGE,
  NETWORK_ERROR_STATUS,
  SERVER_ERROR_MIN_STATUS,
  UNKNOWN_ERROR_MESSAGE,
} from './api.constants';

export interface ApiErrorInit {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

/** API xatosi (docs/12 §0 formati): `code`, HTTP `status` va `details` bilan tiplangan. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor({ status, code, message, details = null }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** `VALIDATION_ERROR` javobidagi maydon xatolari (`details[]`); boshqa xatolarda — bo'sh. */
  get fieldErrors(): FieldErrorDetail[] {
    return Array.isArray(this.details) ? this.details.filter(isFieldErrorDetail) : [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFieldErrorDetail(value: unknown): value is FieldErrorDetail {
  return isRecord(value) && typeof value.field === 'string' && typeof value.message === 'string';
}

const KNOWN_CODES = new Set<string>(Object.values(ErrorCode));

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value) || !isRecord(value.error)) {
    return false;
  }
  const { code, message } = value.error;
  return typeof code === 'string' && KNOWN_CODES.has(code) && typeof message === 'string';
}

/**
 * Body `ApiErrorBody` bo'lmagan javoblar (masalan API o'chiq bo'lsa Next proxy'ning 5xx matni)
 * uchun HTTP holatidan xato kodi.
 */
function fallbackCode(status: number): ErrorCode {
  if (status >= SERVER_ERROR_MIN_STATUS) {
    return ErrorCode.SERVICE_UNAVAILABLE;
  }
  if (status === HttpStatus.UNAUTHORIZED) {
    return ErrorCode.UNAUTHORIZED;
  }
  return status === HttpStatus.TOO_MANY_REQUESTS ? ErrorCode.RATE_LIMITED : ErrorCode.BAD_REQUEST;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch (_error) {
    return null;
  }
}

/** Xato javobini `ApiError` ga aylantiradi (body `ApiErrorBody` bo'lmasa — HTTP holatidan). */
export async function toApiError(response: Response): Promise<ApiError> {
  const body = await readJson(response);
  if (isApiErrorBody(body)) {
    return new ApiError({ status: response.status, ...body.error });
  }
  return new ApiError({
    status: response.status,
    code: fallbackCode(response.status),
    message: UNKNOWN_ERROR_MESSAGE,
  });
}

/** `fetch` umuman javob olmagan holat (tarmoq yo'q, server o'chiq). */
export function networkError(): ApiError {
  return new ApiError({
    status: NETWORK_ERROR_STATUS,
    code: ErrorCode.SERVICE_UNAVAILABLE,
    message: NETWORK_ERROR_MESSAGE,
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
