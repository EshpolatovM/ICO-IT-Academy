import { Role } from '@lms/shared';
import type { AccountRole } from '@lms/shared';

/**
 * Telefon raqam + parol bilan kiradigan xodim rollari (CLAUDE.md "Kirish", docs/02-auth.md).
 * Student ID + parol bilan, ota-ona esa token bilan kiradi.
 */
export const STAFF_ROLES: readonly AccountRole[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR];

/** Akkauntli rollar (docs/12: `SA A M S`) — ota-ona (virtual PARENT) bundan tashqari. */
export const ACCOUNT_ROLES: readonly AccountRole[] = [...STAFF_ROLES, Role.STUDENT];
