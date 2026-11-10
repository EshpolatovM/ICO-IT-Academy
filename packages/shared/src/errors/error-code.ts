/**
 * API xato kodlari (docs/12-api.md §0). Backend javobdagi `error.code` ni shu ro'yxatdan oladi,
 * frontend esa xatolarni shu kodlar bo'yicha ajratadi.
 *
 * Umumiy kodlar — HTTP holatlariga mos; domen kodlari (`REVIEW_REQUIRED`, `INSUFFICIENT_COINS`, ...)
 * docs/12 §0 jadvalidan.
 */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  PASSWORD_CHANGE_REQUIRED: 'PASSWORD_CHANGE_REQUIRED',
  LOCKED: 'LOCKED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INSUFFICIENT_COINS: 'INSUFFICIENT_COINS',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  ALREADY_DONE: 'ALREADY_DONE',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Validatsiya xatosidagi bitta maydon (`400` javobda `details[]`, docs/12 §0). */
export interface FieldErrorDetail {
  /** Maydon yo'li, nuqta bilan (`items.0.title`); butun obyekt uchun bo'sh qator. */
  field: string;
  message: string;
}

/** Barcha xato javoblarining yagona formati (docs/12 §0). */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details: unknown;
  };
}
