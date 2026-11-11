import { Module } from '@nestjs/common';

import { HealthController } from './controllers/health.controller.js';
import { DatabaseHealthRepository } from './repositories/database-health.repository.js';
import { HealthService } from './services/health.service.js';

@Module({
  controllers: [HealthController],
  providers: [HealthService, DatabaseHealthRepository],
})
export class HealthModule {}
