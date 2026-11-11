import { Logger } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { HEALTH_CHECK_TIMEOUT_MS } from '../health.constants.js';

import { HealthService } from './health.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';
import type { DatabaseHealthRepository } from '../repositories/database-health.repository.js';

function createService(databasePing: () => Promise<void>, redisPing: () => Promise<void>) {
  const database = { ping: jest.fn(databasePing) } as unknown as DatabaseHealthRepository;
  const redis = { ping: jest.fn(redisPing) } as unknown as RedisService;
  return new HealthService(database, redis);
}

async function captureAppException(promise: Promise<unknown>): Promise<AppException> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof AppException) {
      return error;
    }
  }
  throw new Error('AppException kutilgan edi');
}

describe('HealthService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hammasi ishlasa — status ok', async () => {
    const service = createService(
      () => Promise.resolve(),
      () => Promise.resolve(),
    );

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('Redis ishlamasa — 503 SERVICE_UNAVAILABLE, details.checks da holat', async () => {
    const service = createService(
      () => Promise.resolve(),
      () => Promise.reject(new Error('ECONNREFUSED')),
    );

    const error = await captureAppException(service.check());

    expect(error.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
    expect(error.status).toBe(503);
    expect(error.details).toEqual({ checks: { database: 'up', redis: 'down' } });
  });

  it("osilib qolgan baza tekshiruvi timeout bilan down bo'ladi", async () => {
    jest.useFakeTimers();
    const service = createService(
      () => new Promise<void>(() => undefined),
      () => Promise.resolve(),
    );

    const pending = captureAppException(service.check());
    await jest.advanceTimersByTimeAsync(HEALTH_CHECK_TIMEOUT_MS);
    const error = await pending;
    jest.useRealTimers();

    expect(error.details).toEqual({ checks: { database: 'down', redis: 'up' } });
  });
});
