import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppException } from './app.exception.js';

describe('AppException', () => {
  it("kod bo'yicha standart holat va xabarni oladi", () => {
    const exception = new AppException({ code: ErrorCode.INSUFFICIENT_COINS });

    expect(exception.status).toBe(HttpStatus.CONFLICT);
    expect(exception.message).toBe('Coin yetarli emas');
    expect(exception.isServerError).toBe(false);
  });

  it('docs/12 §0 formatidagi body qaytaradi', () => {
    const exception = new AppException({
      code: ErrorCode.REVIEW_REQUIRED,
      message: 'Avval takrorlashlarni bajaring',
      details: { dueTopics: 3 },
    });

    expect(exception.toBody()).toEqual({
      error: {
        code: 'REVIEW_REQUIRED',
        message: 'Avval takrorlashlarni bajaring',
        details: { dueTopics: 3 },
      },
    });
  });

  it("details berilmasa null bo'ladi", () => {
    expect(new AppException({ code: ErrorCode.NOT_FOUND }).toBody().error.details).toBeNull();
  });

  it.each([
    [HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND],
    [HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED],
    [HttpStatus.TOO_MANY_REQUESTS, ErrorCode.RATE_LIMITED],
    [HttpStatus.PAYLOAD_TOO_LARGE, ErrorCode.PAYLOAD_TOO_LARGE],
    [HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.BAD_REQUEST],
    [HttpStatus.BAD_GATEWAY, ErrorCode.INTERNAL_ERROR],
  ])('fromHttpStatus(%i) → %s, holat saqlanadi', (status, code) => {
    const exception = AppException.fromHttpStatus(status);

    expect(exception.code).toBe(code);
    expect(exception.status).toBe(status);
  });
});
