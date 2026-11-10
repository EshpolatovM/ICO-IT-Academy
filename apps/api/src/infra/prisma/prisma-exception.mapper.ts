import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../../common/exceptions/app.exception.js';

import { Prisma } from './generated/client.js';

import type { ExceptionMapper } from '../../common/filters/exception-mapper.interface.js';

/** Prisma xato kodlari: https://www.prisma.io/docs/orm/reference/error-reference */
const PRISMA_UNIQUE_VIOLATION = 'P2002';
const PRISMA_RECORD_NOT_FOUND = 'P2025';

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
 * Prisma xatolarini domen xatosiga aylantiradi: unique → 409, topilmadi → 404.
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
    if (error.code === PRISMA_RECORD_NOT_FOUND) {
      return new AppException({ code: ErrorCode.NOT_FOUND, cause: error });
    }
    return undefined;
  }
}
