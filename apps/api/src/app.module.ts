import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { AppConfigModule } from './common/config/app-config.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { EXCEPTION_MAPPERS } from './common/filters/exception-mapper.interface.js';
import { ParentReadOnlyGuard } from './common/guards/parent-read-only.guard.js';
import { PasswordChangeRequiredGuard } from './common/guards/password-change-required.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe.js';
import { ScopeModule } from './common/scope/scope.module.js';
import { SecurityModule } from './common/security/security.module.js';
import { AppLoggerModule } from './infra/logger/app-logger.module.js';
import { PrismaExceptionMapper } from './infra/prisma/prisma-exception.mapper.js';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { RedisModule } from './infra/redis/redis.module.js';
import { AdminUsersModule } from './modules/admin-users/admin-users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { ContentModule } from './modules/content/content.module.js';
import { GroupsModule } from './modules/groups/groups.module.js';
import { MentorScopeModule } from './modules/groups/mentor-scope.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { ParentAccessModule } from './modules/parent-access/parent-access.module.js';
import { PasswordResetModule } from './modules/password-reset/password-reset.module.js';
import { UsersModule } from './modules/users/users.module.js';

import type { ExceptionMapper } from './common/filters/exception-mapper.interface.js';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    PrismaModule,
    RedisModule,
    SecurityModule,
    ScopeModule,
    MentorScopeModule,
    UsersModule,
    AuthModule,
    ParentAccessModule,
    PasswordResetModule,
    AdminUsersModule,
    GroupsModule,
    ContentModule,
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
    // Global guard'lar shu tartibda ishlaydi (docs/01 §3.2): autentifikatsiya → parol almashtirish →
    // rol → ota-ona faqat o'qish. Resursga egalik (`@StudentScope`) — endpoint guard'i, ulardan keyin.
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PasswordChangeRequiredGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ParentReadOnlyGuard },
  ],
})
export class AppModule {}
