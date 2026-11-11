import type { AppException } from '../exceptions/app.exception.js';

/**
 * Tashqi kutubxona xatosini (masalan Prisma) `AppException` ga aylantiruvchi.
 * Xatoni tanimasa `undefined` qaytaradi. Filter infra'ga bog'lanmasligi uchun DI orqali beriladi.
 */
export interface ExceptionMapper {
  map(error: unknown): AppException | undefined;
}

export const EXCEPTION_MAPPERS = Symbol('EXCEPTION_MAPPERS');
