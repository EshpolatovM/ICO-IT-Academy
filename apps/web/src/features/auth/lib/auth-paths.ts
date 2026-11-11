import { Role } from '@lms/shared';
import type { AccountRole, AuthUser } from '@lms/shared';

import type { AccountZone } from '../types/auth.types';

/** Auth sahifalari yo'llari (docs/03 §1). */
export const AuthPath = {
  STUDENT_LOGIN: '/login',
  STAFF_LOGIN: '/login/staff',
  CHANGE_PASSWORD: '/change-password',
} as const;

/** Rol bosh sahifalari (1.8 Tech Lead qarori). */
export const ROLE_HOME_PATH: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '/admin',
  [Role.ADMIN]: '/admin',
  [Role.MENTOR]: '/mentor',
  [Role.STUDENT]: '/path',
  [Role.PARENT]: '/parent',
};

/** Zonaga kira oladigan rollar. Admin zonasi super admin uchun ham (docs/03 §4). */
export const ZONE_ROLES: Record<AccountZone, readonly AccountRole[]> = {
  student: [Role.STUDENT],
  mentor: [Role.MENTOR],
  admin: [Role.ADMIN, Role.SUPER_ADMIN],
};

/** Sessiyasiz kirilganda zona bo'yicha login sahifasi. */
export const ZONE_LOGIN_PATH: Record<AccountZone, string> = {
  student: AuthPath.STUDENT_LOGIN,
  mentor: AuthPath.STAFF_LOGIN,
  admin: AuthPath.STAFF_LOGIN,
};

/** Rolning login sahifasi: student — ID bilan, staff — telefon bilan. */
export function loginPathForRole(role: AccountRole): string {
  return role === Role.STUDENT ? AuthPath.STUDENT_LOGIN : AuthPath.STAFF_LOGIN;
}

/** Kirgandan keyin qayerga: parolni almashtirish majburiy bo'lsa — o'sha sahifa, aks holda bosh sahifa. */
export function postLoginPath(user: Pick<AuthUser, 'role' | 'mustChangePassword'>): string {
  return user.mustChangePassword ? AuthPath.CHANGE_PASSWORD : ROLE_HOME_PATH[user.role];
}
