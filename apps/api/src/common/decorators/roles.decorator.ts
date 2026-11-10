import { SetMetadata } from '@nestjs/common';

import type { Role } from '@lms/shared';

export const ROLES_KEY = 'auth:roles';

/** Endpointga ruxsat etilgan rollar (`RolesGuard`, docs/01 §3.2). Berilmasa — har qanday autentifikatsiyalangan. */
export const Roles = (...roles: readonly Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
