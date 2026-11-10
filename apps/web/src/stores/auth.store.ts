import { create } from 'zustand';

import type { AccountRole, AuthUser } from '@lms/shared';

/**
 * - `unknown` — sessiya hali tiklanmagan (sahifa yangi ochilgan, `POST /auth/refresh` kutilmoqda);
 * - `authenticated` — access token va foydalanuvchi identifikatsiyasi bor;
 * - `anonymous` — sessiya yo'q yoki tugagan (login sahifasiga).
 */
export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';

export interface AuthState {
  status: AuthStatus;
  /** Access token FAQAT xotirada (docs/02 §3): localStorage/sessionStorage'ga yozilmaydi. */
  accessToken: string | null;
  /**
   * Token egasining minimal identifikatsiyasi (rol, `mustChangePassword`, ism) — route guard'lar uni
   * sinxron o'qiydi. U token bilan birga keladi (login javobi) va token bilan birga almashadi.
   */
  user: AuthUser | null;
  /** Oxirgi kirgan rol — sessiya tugagach (yoki chiqishda) to'g'ri login sahifasiga qaytarish uchun. */
  lastRole: AccountRole | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

const INITIAL_STATE = { status: 'unknown', accessToken: null, user: null, lastRole: null } as const;

/** Faqat client auth holati (CLAUDE.md "Frontend state"): server ma'lumotlari bu yerda saqlanmaydi. */
export const useAuthStore = create<AuthState>()((set) => ({
  ...INITIAL_STATE,
  setSession: (accessToken, user) => {
    set({ status: 'authenticated', accessToken, user, lastRole: user.role });
  },
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clear: () => {
    set((state) => ({
      status: 'anonymous',
      accessToken: null,
      user: null,
      lastRole: state.user?.role ?? state.lastRole,
    }));
  },
}));

/** Testlar uchun: store'ni boshlang'ich (`unknown`) holatga qaytaradi. */
export function resetAuthStore(): void {
  useAuthStore.setState(INITIAL_STATE);
}
