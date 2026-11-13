import {
  ForeignKeyViolationError,
  UniqueViolationError,
} from '../../common/exceptions/constraint-violation.error.js';

import { Prisma } from './generated/client.js';
import { translateConstraintErrors } from './prisma-constraint.js';

function knownError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('prisma xatosi', {
    code,
    clientVersion: '7.10.1',
  });
}

describe('translateConstraintErrors', () => {
  it("natija o'zgarishsiz qaytadi", async () => {
    await expect(translateConstraintErrors(() => Promise.resolve(7))).resolves.toBe(7);
  });

  it.each([
    ['P2002', UniqueViolationError],
    ['P2003', ForeignKeyViolationError],
  ])('%s → domen xatosi', async (code, type) => {
    await expect(
      translateConstraintErrors(() => Promise.reject(knownError(code))),
    ).rejects.toBeInstanceOf(type);
  });

  it("boshqa xatolar o'zgarishsiz", async () => {
    const other = knownError('P2025');
    const plain = new Error('x');

    await expect(translateConstraintErrors(() => Promise.reject(other))).rejects.toBe(other);
    await expect(translateConstraintErrors(() => Promise.reject(plain))).rejects.toBe(plain);
  });
});
