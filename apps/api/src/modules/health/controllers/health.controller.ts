import { Controller, Get } from '@nestjs/common';

import type { HealthResponse } from '@lms/shared';

import { Public } from '../../../common/decorators/public.decorator.js';
import { HealthService } from '../services/health.service.js';

/** `GET /api/v1/health` — PUB (ichki), docs/12. */
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): Promise<HealthResponse> {
    return this.healthService.check();
  }
}
