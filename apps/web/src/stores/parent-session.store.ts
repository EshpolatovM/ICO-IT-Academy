import { create } from 'zustand';

/**
 * Ota-ona sessiyasi (`ps` cookie, HttpOnly — JS uni ko'rmaydi), shuning uchun faqat client holati:
 * - `unknown` — hali tekshirilmagan (body'siz exchange kutilmoqda);
 * - `active` — sessiya bor, farzandlar ko'rsatiladi;
 * - `none` — sessiya yo'q, token kiritish formasi.
 */
export type ParentSessionStatus = 'unknown' | 'active' | 'none';

export interface ParentSessionState {
  status: ParentSessionStatus;
  /** Havoladagi token yaroqsiz bo'lsa — foydalanuvchiga ko'rsatiladigan xabar. */
  linkError: string | null;
  setStatus: (status: ParentSessionStatus) => void;
  setLinkError: (message: string | null) => void;
}

const INITIAL_STATE = { status: 'unknown', linkError: null } as const;

export const useParentSessionStore = create<ParentSessionState>()((set) => ({
  ...INITIAL_STATE,
  setStatus: (status) => {
    set({ status });
  },
  setLinkError: (linkError) => {
    set({ linkError });
  },
}));

/** Testlar uchun: boshlang'ich holat. */
export function resetParentSessionStore(): void {
  useParentSessionStore.setState(INITIAL_STATE);
}
