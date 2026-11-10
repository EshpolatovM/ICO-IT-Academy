import { Role } from '@lms/shared';

/**
 * Telefon raqam + parol bilan kiradigan xodim rollari (CLAUDE.md "Kirish", docs/02-auth.md).
 * Student ID + parol bilan, ota-ona esa token bilan kiradi.
 */
export const STAFF_ROLES: readonly Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR];
