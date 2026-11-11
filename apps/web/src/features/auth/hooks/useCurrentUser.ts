'use client';

import type { AuthUser } from '@lms/shared';

import { useAuthStore } from '@/stores/auth.store';

/** Joriy foydalanuvchi identifikatsiyasi (guard ichida — har doim mavjud). */
export function useCurrentUser(): AuthUser | null {
  return useAuthStore((state) => state.user);
}
