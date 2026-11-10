'use client';

import { createContext, useContext } from 'react';

import type { RefObject } from 'react';

/** `AppShell` mobil menyusi holati: `TopBar` dagi menyu tugmasi shu orqali boshqaradi. */
export interface AppShellNavState {
  open: boolean;
  toggle: () => void;
  /** Panel elementining `id` si (`aria-controls` uchun). */
  panelId: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
}

export const AppShellNavContext = createContext<AppShellNavState | null>(null);

/** `AppShell` (yon panelli) ichida bo'lsa — menyu holati, aks holda `null`. */
export function useAppShellNav(): AppShellNavState | null {
  return useContext(AppShellNavContext);
}
