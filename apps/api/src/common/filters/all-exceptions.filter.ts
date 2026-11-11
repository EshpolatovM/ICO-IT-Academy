import { Catch, HttpException, Inject, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';
import {
  MIN_CLIENT_ERROR_STATUS,
  MIN_SERVER_ERROR_STATUS,
} from '../exceptions/error-defaults.constants.js';

import { EXCEPTION_MAPPERS } from './exception-mapper.interface.js';

import type { ExceptionMapper } from './exception-mapper.interface.js';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

/** Express/body-parser xatolari (`http-errors`): masalan buzilgan JSON — `status` 4xx, `expose: true`. */
function clientHttpErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  const { status, expose } = error as { status?: unknown; expose?: unknown };
  const isClientStatus =
    typeof status === 'number' &&
    status >= MIN_CLIENT_ERROR_STATUS &&
    status < MIN_SERVER_ERROR_STATUS;
  return isClientStatus && expose === true ? status : undefined;
}

/**
 * Global exception filter: har qanday xato docs/12 §0 formatida qaytadi —
 * `{ "error": { "code", "message", "details" } }`. 5xx bo'lsa ichki tafsilot javobga
 * chiqmaydi, faqat logga yoziladi.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(EXCEPTION_MAPPERS) private readonly mappers: readonly ExceptionMapper[],
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const appException = this.toAppException(exception);
    if (appException.isServerError) {
      this.logger.error(exception);
    }
    const response: unknown = host.switchToHttp().getResponse();
    this.adapterHost.httpAdapter.reply(response, appException.toBody(), appException.status);
  }

  private toAppException(exception: unknown): AppException {
    if (exception instanceof AppException) {
      return exception;
    }
    for (const mapper of this.mappers) {
      const mapped = mapper.map(exception);
      if (mapped) {
        return mapped;
      }
    }
    if (exception instanceof HttpException) {
      return AppException.fromHttpStatus(exception.getStatus());
    }
    const clientStatus = clientHttpErrorStatus(exception);
    if (clientStatus !== undefined) {
      return AppException.fromHttpStatus(clientStatus);
    }
    return new AppException({ code: ErrorCode.INTERNAL_ERROR, cause: exception });
  }
}
