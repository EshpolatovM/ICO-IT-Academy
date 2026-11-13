import {
  ForeignKeyViolationError,
  UniqueViolationError,
} from '../../common/exceptions/constraint-violation.error.js';

import { Prisma } from './generated/client.js';
import { PRISMA_FOREIGN_KEY_VIOLATION, PRISMA_UNIQUE_VIOLATION } from './prisma-error-codes.js';

/** Prisma unique/FK xatosi → domen xatosi; boshqa xatolar o'zgarishsiz qaytariladi. */
export function toConstraintViolation(error: unknown): unknown {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return error;
  }
  if (error.code === PRISMA_UNIQUE_VIOLATION) {
    return new UniqueViolationError(error.message, { cause: error });
  }
  if (error.code === PRISMA_FOREIGN_KEY_VIOLATION) {
    return new ForeignKeyViolationError(error.message, { cause: error });
  }
  return error;
}

/** Repository yozuvi: unique/FK buzilishi domen xatosi sifatida tashlanadi. */
export async function translateConstraintErrors<T>(action: () => PromiseLike<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw toConstraintViolation(error);
  }
}
