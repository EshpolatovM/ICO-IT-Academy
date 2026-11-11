import type { RequestUser } from '../auth/request-user.types.js';

/**
 * Foydalanuvchi berilgan studentning ma'lumotlariga kira oladimi (docs/01 §3.2 `@StudentScope`).
 * `false` — scope'dan tashqarida (guard 404 qaytaradi, docs/12 §0). Implementatsiya
 * `STUDENT_SCOPE_RESOLVER` tokeni bilan almashtiriladi (2-bosqichda mentor guruhlari bilan).
 */
export interface StudentScopeResolver {
  canAccess(user: RequestUser, studentId: string): Promise<boolean>;
}

export const STUDENT_SCOPE_RESOLVER = Symbol('STUDENT_SCOPE_RESOLVER');

/** `@StudentScope('param')` metadata kaliti: qaysi URL parametri student id'si. */
export const STUDENT_SCOPE_PARAM_KEY = 'scope:studentParam';
