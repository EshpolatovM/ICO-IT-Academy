import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';

import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export const INVALID_UUID_MESSAGE = "Identifikator noto'g'ri (UUID kutilgan)";

const uuidSchema = z.uuid();

/**
 * URL parametri UUID bo'lishi shart: aks holda 400 `VALIDATION_ERROR` (`details[].field` — parametr
 * nomi). Pipe va pipe'lardan oldin ishlaydigan guard'lar (`StudentScopeGuard`) ishlatadi.
 */
export function assertUuidParam(value: string, field: string): string {
  if (uuidSchema.safeParse(value).success) {
    return value;
  }
  throw new AppException({
    code: ErrorCode.VALIDATION_ERROR,
    details: [{ field, message: INVALID_UUID_MESSAGE }],
  });
}

/**
 * URL parametri UUID ekanini tekshiradi. Noto'g'ri bo'lsa — 400 `VALIDATION_ERROR`,
 * `details: [{ field: <parametr nomi>, message }]` (docs/12 §0 — boshqa validatsiya xatolari bilan
 * bir xil shakl; Nest'ning `ParseUUIDPipe` i `BAD_REQUEST` beradi). `@UuidParam()` orqali ishlatiladi.
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    return assertUuidParam(value, metadata.data ?? '');
  }
}
