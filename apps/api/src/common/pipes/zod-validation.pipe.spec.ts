import { z } from 'zod';

import { ErrorCode, offsetPaginationQuerySchema } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';
import { createZodDto } from '../validation/zod-dto.js';

import { ZodValidationPipe } from './zod-validation.pipe.js';

import type { ArgumentMetadata } from '@nestjs/common';

class PaginationDto extends createZodDto(offsetPaginationQuerySchema) {}
class ProfileDto extends createZodDto(
  z.object({ firstName: z.string().min(1), address: z.object({ city: z.string() }) }),
) {}

const pipe = new ZodValidationPipe();
const meta = (metatype: ArgumentMetadata['metatype']): ArgumentMetadata => ({
  type: 'body',
  metatype,
});

function captureError(fn: () => unknown): AppException {
  try {
    fn();
  } catch (error) {
    if (error instanceof AppException) {
      return error;
    }
  }
  throw new Error('AppException kutilgan edi');
}

describe('ZodValidationPipe', () => {
  it("zod DTO bo'lmagan parametrni o'zgartirmaydi", () => {
    expect(pipe.transform('abc', meta(String))).toBe('abc');
    expect(pipe.transform({ a: 1 }, meta(undefined))).toEqual({ a: 1 });
  });

  it('sxema natijasini qaytaradi (coerce, default, strip)', () => {
    expect(pipe.transform({ page: '2', extra: 'x' }, meta(PaginationDto))).toEqual({
      page: 2,
      pageSize: 20,
    });
  });

  it("xato bo'lsa 400 VALIDATION_ERROR, details[] da maydon yo'llari", () => {
    const error = captureError(() =>
      pipe.transform({ firstName: '', address: {} }, meta(ProfileDto)),
    );

    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.status).toBe(400);
    expect(error.details).toEqual([
      { field: 'firstName', message: expect.any(String) as string },
      { field: 'address.city', message: expect.any(String) as string },
    ]);
  });
});
