import { Injectable, Logger } from '@nestjs/common';

import { ErrorCode, HealthCheckStatus } from '@lms/shared';
import type { HealthChecks, HealthResponse } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { withTimeout } from '../../../common/utils/with-timeout.js';
import { RedisService } from '../../../infra/redis/redis.service.js';
import { HEALTH_CHECK_TIMEOUT_MS } from '../health.constants.js';
import { DatabaseHealthRepository } from '../repositories/database-health.repository.js';

/**
 * Tashqi bog'liqliklar (PostgreSQL, Redis) holati. Hammasi `up` — 200; biror tekshiruv `down` —
 * `503 SERVICE_UNAVAILABLE`, `details.checks` da holatlar (docs/12 §0 formati).
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly database: DatabaseHealthRepository,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthResponse> {
    const [database, redis] = await Promise.all([
      this.probe('database', () => this.database.ping()),
      this.probe('redis', () => this.redis.ping()),
    ]);
    const checks: HealthChecks = { database, redis };
    if (Object.values(checks).includes(HealthCheckStatus.DOWN)) {
      throw new AppException({ code: ErrorCode.SERVICE_UNAVAILABLE, details: { checks } });
    }
    return { status: 'ok', checks };
  }

  private async probe(
    name: keyof HealthChecks,
    check: () => Promise<void>,
  ): Promise<HealthCheckStatus> {
    try {
      await withTimeout(check(), HEALTH_CHECK_TIMEOUT_MS);
      return HealthCheckStatus.UP;
    } catch (error) {
      this.logger.warn(`Health: ${name} ishlamayapti — ${String(error)}`);
      return HealthCheckStatus.DOWN;
    }
  }
}
