import { randomUUID } from 'node:crypto';

import { ErrorCode } from '@lms/shared';

import { INVALID_UUID_MESSAGE, ParseUuidPipe } from './parse-uuid.pipe.js';

import type { ArgumentMetadata } from '@nestjs/common';

const metadata: ArgumentMetadata = { type: 'param', data: 'tokenId' };

describe('ParseUuidPipe', () => {
  const pipe = new ParseUuidPipe();

  it("to'g'ri UUID — o'zgarishsiz qaytadi", () => {
    const id = randomUUID();

    expect(pipe.transform(id, metadata)).toBe(id);
  });

  it("noto'g'ri qiymat — 400 VALIDATION_ERROR, details[] da parametr nomi", () => {
    expect(() => pipe.transform('not-a-uuid', metadata)).toThrow(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        status: 400,
        details: [{ field: 'tokenId', message: INVALID_UUID_MESSAGE }],
      }) as Error,
    );
  });
});
