import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../../common/exceptions/app.exception.js';

import { Prisma } from './generated/client.js';
import {
  PRISMA_FOREIGN_KEY_VIOLATION,
  PRISMA_RECORD_NOT_FOUND,
  PRISMA_UNIQUE_VIOLATION,
} from './prisma-error-codes.js';

import type { ExceptionMapper } from '../../common/filters/exception-mapper.interface.js';

interface AdapterConstraint {
  fields?: unknown;
  index?: unknown;
}

/**
 * Unique buzilgan joy: klassik `meta.target` (maydonlar) yoki driver adapter (`@prisma/adapter-pg`)
 * meta'sidagi `constraint.fields` / `constraint.index` (masalan `uq_users_phone`).
 */
function uniqueTarget(meta: Record<string, unknown> | undefined): unknown {
  if (meta?.target !== undefined) {
    return meta.target;
  }
  const adapterError = meta?.driverAdapterError as
    { cause?: { constraint?: AdapterConstraint } } | undefined;
  const constraint = adapterError?.cause?.constraint;
  return constraint?.fields ?? constraint?.index ?? null;
}

/**
 * Prisma xatolarini domen xatosiga aylantiradi: unique → 409, FK (`P2003`) → 409 `details: null`
 * (zaxira: aniq sababni servis o'zi beradi), topilmadi → 404.
 * Boshqa Prisma xatolari filter'da 500 bo'ladi (tafsiloti faqat logda).
 */
@Injectable()
export class PrismaExceptionMapper implements ExceptionMapper {
  map(error: unknown): AppException | undefined {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return undefined;
    }
    if (error.code === PRISMA_UNIQUE_VIOLATION) {
      return new AppException({
        code: ErrorCode.CONFLICT,
        details: { target: uniqueTarget(error.meta) },
        cause: error,
      });
    }
    if (error.code === PRISMA_FOREIGN_KEY_VIOLATION) {
      return new AppException({ code: ErrorCode.CONFLICT, cause: error });
    }
    if (error.code === PRISMA_RECORD_NOT_FOUND) {
      return new AppException({ code: ErrorCode.NOT_FOUND, cause: error });
    }
    return undefined;
  }
}
