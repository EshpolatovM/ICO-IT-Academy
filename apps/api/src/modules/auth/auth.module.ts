import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppConfigService } from '../../common/config/app-config.service.js';
import { FixedWindowRateLimiter } from '../../common/rate-limit/fixed-window-rate-limiter.service.js';
import { SecurityModule } from '../../common/security/security.module.js';
import { ParentAccessModule } from '../parent-access/parent-access.module.js';
import { UsersModule } from '../users/users.module.js';

import { ACCESS_TOKEN_ALGORITHM } from './auth.constants.js';
import { AccountController } from './controllers/account.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { ParentAuthController } from './controllers/parent-auth.controller.js';
import { SessionsController } from './controllers/sessions.controller.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository.js';
import { AccessTokenService } from './services/access-token.service.js';
import { ChangePasswordRateLimiter } from './services/change-password-rate-limiter.service.js';
import { LoginRateLimiter } from './services/login-rate-limiter.service.js';
import { LoginService } from './services/login.service.js';
import { LogoutService } from './services/logout.service.js';
import { MeService } from './services/me.service.js';
import { ParentCookiesService } from './services/parent-cookies.service.js';
import { ParentExchangeRateLimiter } from './services/parent-exchange-rate-limiter.service.js';
import { ParentExchangeService } from './services/parent-exchange.service.js';
import { ParentSessionAuthenticator } from './services/parent-session-authenticator.service.js';
import { ParentSessionTokenService } from './services/parent-session-token.service.js';
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
 * sessiyalar, ota-ona exchange va parent session. `JwtAuthGuard` eksport qilinadi — `AppModule`
 * uni global guard qiladi; `TokenVersionService` — parol tiklash moduli uchun.
 */
@Module({
  imports: [
    UsersModule,
    SecurityModule,
    ParentAccessModule,
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
  controllers: [AuthController, AccountController, SessionsController, ParentAuthController],
  providers: [
    RefreshTokensRepository,
    AccessTokenService,
    RefreshTokenService,
    TokenVersionService,
    LoginRateLimiter,
    ChangePasswordRateLimiter,
    PasswordVerifier,
    SessionIssuer,
    LoginService,
    TokenRefreshService,
    PasswordChangeService,
    SessionsService,
    MeService,
    RefreshCookieService,
    FixedWindowRateLimiter,
    LogoutService,
    ParentSessionTokenService,
    ParentCookiesService,
    ParentExchangeRateLimiter,
    ParentExchangeService,
    ParentSessionAuthenticator,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, TokenVersionService],
})
export class AuthModule {}
