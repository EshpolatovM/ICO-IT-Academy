import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppConfigService } from '../../common/config/app-config.service.js';
import { SecurityModule } from '../../common/security/security.module.js';
import { UsersModule } from '../users/users.module.js';

import { ACCESS_TOKEN_ALGORITHM } from './auth.constants.js';
import { AccountController } from './controllers/account.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { SessionsController } from './controllers/sessions.controller.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository.js';
import { AccessTokenService } from './services/access-token.service.js';
import { LoginRateLimiter } from './services/login-rate-limiter.service.js';
import { LoginService } from './services/login.service.js';
import { MeService } from './services/me.service.js';
import { PasswordChangeService } from './services/password-change.service.js';
import { PasswordVerifier } from './services/password-verifier.service.js';
import { RefreshCookieService } from './services/refresh-cookie.service.js';
import { RefreshTokenService } from './services/refresh-token.service.js';
import { SessionIssuer } from './services/session-issuer.service.js';
import { SessionsService } from './services/sessions.service.js';
import { TokenRefreshService } from './services/token-refresh.service.js';
import { TokenVersionService } from './services/token-version.service.js';

/**
 * Auth moduli (docs/02): staff/student kirish, refresh rotation, chiqish, parol almashtirish,
 * sessiyalar. `JwtAuthGuard` eksport qilinadi — `AppModule` uni global guard qiladi.
 */
@Module({
  imports: [
    UsersModule,
    SecurityModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: {
          algorithm: ACCESS_TOKEN_ALGORITHM,
          expiresIn: config.get('JWT_ACCESS_TTL_SECONDS'),
        },
        verifyOptions: { algorithms: [ACCESS_TOKEN_ALGORITHM] },
      }),
    }),
  ],
  controllers: [AuthController, AccountController, SessionsController],
  providers: [
    RefreshTokensRepository,
    AccessTokenService,
    RefreshTokenService,
    TokenVersionService,
    LoginRateLimiter,
    PasswordVerifier,
    SessionIssuer,
    LoginService,
    TokenRefreshService,
    PasswordChangeService,
    SessionsService,
    MeService,
    RefreshCookieService,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
