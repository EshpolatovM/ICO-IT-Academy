import { SetMetadata } from '@nestjs/common';

export const ANY_AUTHENTICATED_KEY = 'auth:anyAuthenticated';

/**
 * Endpoint har qanday autentifikatsiyalangan foydalanuvchi uchun (docs/12: `ANY`, ota-ona ham).
 * `RolesGuard` deny-by-default: `@Public()`, `@Roles(...)` yoki shu dekoratordan biri bo'lmasa — 403.
 */
export const AnyAuthenticated = (): MethodDecorator & ClassDecorator =>
  SetMetadata(ANY_AUTHENTICATED_KEY, true);
