import { ErrorCode } from '@lms/shared';

import { Prisma } from './generated/client.js';
import { PrismaExceptionMapper } from './prisma-exception.mapper.js';

const CLIENT_VERSION = '7.10.1';

function knownError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('prisma xatosi', {
    code,
    clientVersion: CLIENT_VERSION,
    meta,
  });
}

describe('PrismaExceptionMapper', () => {
  const mapper = new PrismaExceptionMapper();

  it('P2002 (unique) → 409 CONFLICT, maydonlar details da', () => {
    const mapped = mapper.map(knownError('P2002', { target: ['phone'] }));

    expect(mapped?.code).toBe(ErrorCode.CONFLICT);
    expect(mapped?.status).toBe(409);
    expect(mapped?.details).toEqual({ target: ['phone'] });
  });

  it.each([
    [{ fields: ['student_code'] }, ['student_code']],
    [{ index: 'uq_users_phone' }, 'uq_users_phone'],
    [undefined, null],
  ])('P2002 driver adapter meta (%j) → target %j', (constraint, target) => {
    const mapped = mapper.map(
      knownError('P2002', { driverAdapterError: { cause: { constraint } } }),
    );

    expect(mapped?.details).toEqual({ target });
  });

  it('P2025 (topilmadi) → 404 NOT_FOUND', () => {
    const mapped = mapper.map(knownError('P2025'));

    expect(mapped?.code).toBe(ErrorCode.NOT_FOUND);
    expect(mapped?.status).toBe(404);
  });

  it("boshqa Prisma kodlari va Prisma bo'lmagan xatolar tanilmaydi", () => {
    expect(mapper.map(knownError('P2003'))).toBeUndefined();
    expect(mapper.map(new Error('x'))).toBeUndefined();
  });
});
