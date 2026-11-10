import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { AppConfigModule } from './common/config/app-config.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { EXCEPTION_MAPPERS } from './common/filters/exception-mapper.interface.js';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe.js';
import { SecurityModule } from './common/security/security.module.js';
import { AppLoggerModule } from './infra/logger/app-logger.module.js';
import { PrismaExceptionMapper } from './infra/prisma/prisma-exception.mapper.js';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { RedisModule } from './infra/redis/redis.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UsersModule } from './modules/users/users.module.js';

import type { ExceptionMapper } from './common/filters/exception-mapper.interface.js';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    PrismaModule,
    RedisModule,
    SecurityModule,
    UsersModule,
    HealthModule,
  ],
  providers: [
    {
      provide: EXCEPTION_MAPPERS,
      inject: [PrismaExceptionMapper],
      useFactory: (prismaMapper: PrismaExceptionMapper): ExceptionMapper[] => [prismaMapper],
    },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule {}
