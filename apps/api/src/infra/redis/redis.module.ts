import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

import { AppConfigService } from '../../common/config/app-config.service.js';

import { REDIS_CLIENT, REDIS_MAX_RETRIES_PER_REQUEST } from './redis.constants.js';
import { RedisService } from './redis.service.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): Redis =>
        new Redis(config.get('REDIS_URL'), {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: REDIS_MAX_RETRIES_PER_REQUEST,
        }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
