import type { AccountRole, AuthUser } from '@lms/shared';

import type { AuthStatus } from '@/stores/auth.store';

import {
  AuthPath,
  loginPathForRole,
  postLoginPath,
  ZONE_LOGIN_PATH,
  ZONE_ROLES,
} from './auth-paths';

import type { GuardArea, GuardDecision } from '../types/auth.types';

export interface AccessContext {
  status: AuthStatus;
  user: AuthUser | null;
  /** Oxirgi ma'lum rol (sessiya tugagach qaysi login sahifasiga qaytarish uchun). */
  lastRole: AccountRole | null;
}

const WAIT: GuardDecision = { type: 'wait' };
const ALLOW: GuardDecision = { type: 'allow' };

function redirect(to: string): GuardDecision {
  return { type: 'redirect', to };
}

function resolveAnonymous(area: GuardArea, lastRole: AccountRole | null): GuardDecision {
  if (area === 'guest') {
    return ALLOW;
  }
  if (area === 'change-password') {
    return redirect(lastRole === null ? AuthPath.STUDENT_LOGIN : loginPathForRole(lastRole));
  }
  return redirect(ZONE_LOGIN_PATH[area]);
}

function resolveAuthenticated(area: GuardArea, user: AuthUser): GuardDecision {
  if (area === 'guest') {
    return redirect(postLoginPath(user));
  }
  if (user.mustChangePassword && area !== 'change-password') {
    return redirect(AuthPath.CHANGE_PASSWORD);
  }
  if (area === 'change-password' || ZONE_ROLES[area].includes(user.role)) {
    return ALLOW;
  }
  return redirect(postLoginPath(user));
}

/**
 * Route guard mantig'i (sof funksiya):
 * - sessiya tiklanmoqda → kutish (Spinner);
 * - sessiya yo'q → zonaning login sahifasi (student → `/login`, staff → `/login/staff`);
 * - `mustChangePassword` → har qanday himoyalangan sahifadan `/change-password`;
 * - noto'g'ri rol → o'z bosh sahifasi; login sahifasiga kirgan foydalanuvchi → bosh sahifasi.
 */
export function resolveAccess(area: GuardArea, context: AccessContext): GuardDecision {
  if (context.status === 'unknown') {
    return WAIT;
  }
  if (context.status === 'anonymous' || context.user === null) {
    return resolveAnonymous(area, context.lastRole);
  }
  return resolveAuthenticated(area, context.user);
}
