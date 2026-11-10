import { SetMetadata } from '@nestjs/common';

export const ALLOW_PENDING_PASSWORD_CHANGE_KEY = 'auth:allowPendingPasswordChange';

/**
 * `must_change_password = true` bo'lsa ham ishlaydigan endpoint (docs/02 §3:
 * `POST /auth/change-password`, `GET /auth/me`; shuningdek `POST /auth/logout`).
 */
export const AllowPendingPasswordChange = (): MethodDecorator & ClassDecorator =>
  SetMetadata(ALLOW_PENDING_PASSWORD_CHANGE_KEY, true);
