import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';
import type { FieldErrorDetail } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';
import { getZodSchema } from '../validation/zod-dto.js';

import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

const FIELD_PATH_SEPARATOR = '.';

export function toFieldErrors(error: z.ZodError): FieldErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.map(String).join(FIELD_PATH_SEPARATOR),
    message: issue.message,
  }));
}

/**
 * Global validatsiya pipe'i: parametr tipi `createZodDto(...)` bilan yasalgan bo'lsa, qiymat
 * shu sxema bo'yicha tekshiriladi va sxema natijasi (default, coerce, strip qilingan) qaytariladi.
 * Xato bo'lsa — `400 VALIDATION_ERROR`, `details[]` da maydonlar (docs/12 §0).
 * Noma'lum maydonlar standart zod obyektida olib tashlanadi; rad etish kerak bo'lsa sxema `z.strictObject`.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const schema = getZodSchema(metadata.metatype);
    if (!schema) {
      return value;
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new AppException({
        code: ErrorCode.VALIDATION_ERROR,
        details: toFieldErrors(result.error),
      });
    }
    return result.data;
  }
}
