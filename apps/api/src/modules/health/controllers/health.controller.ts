import { Controller, Get } from '@nestjs/common';

import type { HealthResponse } from '@lms/shared';

import { HealthService } from '../services/health.service.js';

/** `GET /api/v1/health` — PUB (ichki), docs/12. Auth guard'lar qo'shilganda `@Public()` bo'ladi. */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): Promise<HealthResponse> {
    return this.healthService.check();
  }
}
