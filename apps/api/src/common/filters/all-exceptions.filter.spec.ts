import {
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';

import { AllExceptionsFilter } from './all-exceptions.filter.js';

import type { ExceptionMapper } from './exception-mapper.interface.js';
import type { ArgumentsHost } from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';

const RESPONSE = { fake: 'response' };

function setup(mappers: ExceptionMapper[] = []) {
  const reply = jest.fn();
  const adapterHost = { httpAdapter: { reply } } as unknown as HttpAdapterHost;
  const host = {
    switchToHttp: () => ({ getResponse: () => RESPONSE }),
  } as unknown as ArgumentsHost;
  const filter = new AllExceptionsFilter(adapterHost, mappers);
  const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  return {
    logError,
    catch: (exception: unknown) => {
      filter.catch(exception, host);
      const [response, body, status] = reply.mock.calls[0] as [unknown, unknown, number];
      return { response, body, status };
    },
  };
}

describe('AllExceptionsFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('AppException — kod, xabar va details bilan', () => {
    const { catch: run, logError } = setup();

    const result = run(
      new AppException({ code: ErrorCode.OUT_OF_STOCK, details: { productId: 'p1' } }),
    );

    expect(result).toEqual({
      response: RESPONSE,
      status: HttpStatus.CONFLICT,
      body: {
        error: { code: 'OUT_OF_STOCK', message: 'Mahsulot qolmagan', details: { productId: 'p1' } },
      },
    });
    expect(logError).not.toHaveBeenCalled();
  });

  it('mapper tanigan xato (masalan Prisma) mapper natijasiga aylanadi', () => {
    const mapped = new AppException({ code: ErrorCode.CONFLICT, details: { fields: ['phone'] } });
    const mapper: ExceptionMapper = { map: (error) => (error === 'prisma' ? mapped : undefined) };

    const { body, status } = setup([mapper]).catch('prisma');

    expect(status).toBe(HttpStatus.CONFLICT);
    expect(body).toEqual(mapped.toBody());
  });

  it('HttpException (route topilmadi) → 404 NOT_FOUND, Nest matni chiqmaydi', () => {
    const { body, status } = setup().catch(new NotFoundException('Cannot GET /api/v1/nope'));

    expect(status).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({ error: { code: 'NOT_FOUND', message: 'Topilmadi', details: null } });
  });

  it('buzilgan JSON (body-parser, status 400, expose) → 400 BAD_REQUEST', () => {
    const parseError = Object.assign(new SyntaxError('Unexpected token'), {
      status: 400,
      expose: true,
    });

    const { body, status } = setup().catch(parseError);

    expect(status).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toMatchObject({ error: { code: 'BAD_REQUEST' } });
  });

  it("noma'lum xato → 500, ichki tafsilot javobga chiqmaydi, logga yoziladi", () => {
    const { catch: run, logError } = setup();
    const secret = new Error('DB parol: hunter2');

    const { body, status } = run(secret);

    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Ichki server xatosi', details: null },
    });
    expect(JSON.stringify(body)).not.toContain('hunter2');
    expect(logError).toHaveBeenCalledWith(secret);
  });

  it('5xx HttpException ham logga yoziladi', () => {
    const { catch: run, logError } = setup();

    expect(run(new InternalServerErrorException('ichki')).status).toBe(500);
    expect(logError).toHaveBeenCalledTimes(1);
  });

  it("status 4xx lekin expose bo'lmagan obyekt → 500", () => {
    expect(setup().catch({ status: 400 }).status).toBe(500);
  });
});
