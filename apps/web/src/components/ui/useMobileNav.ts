'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import type { AppShellNavState } from './AppShellContext';
import type { KeyboardEvent, MouseEvent, RefObject } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]';

function getFocusable(panel: HTMLElement | null): HTMLElement[] {
  if (panel === null) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0,
  );
}

/** Tab panel chegarasidan chiqmasin: oxiridan boshiga va aksincha aylanadi. */
function trapTab(event: KeyboardEvent<HTMLElement>, panel: HTMLElement | null): void {
  const focusable = getFocusable(panel);
  const first = focusable.at(0);
  const last = focusable.at(-1);
  if (first === undefined || last === undefined) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Ochilganda fokus panelga o'tadi; Esc yopadi va fokusni menyu tugmasiga qaytaradi. */
function useOpenPanelEffects(
  open: boolean,
  close: () => void,
  panelRef: RefObject<HTMLElement | null>,
  buttonRef: RefObject<HTMLButtonElement | null>,
): void {
  useEffect(() => {
    if (!open) return undefined;
    getFocusable(panelRef.current).at(0)?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      close();
      buttonRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close, panelRef, buttonRef]);
}

export interface MobileNav {
  state: AppShellNavState;
  panelRef: RefObject<HTMLElement | null>;
  onPanelClick: (event: MouseEvent<HTMLElement>) => void;
  onPanelKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

/** `AppShell` mobil menyusi: ochiq/yopiq holat, Esc, havola bosilganda yopish, fokus. */
export function useMobileNav(): MobileNav {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);
  const toggle = useCallback(() => {
    setOpen((value) => !value);
  }, []);
  useOpenPanelEffects(open, close, panelRef, buttonRef);

  const state = useMemo(
    () => ({ open, toggle, panelId, buttonRef }),
    [open, toggle, panelId, buttonRef],
  );

  const onPanelClick = (event: MouseEvent<HTMLElement>): void => {
    if (event.target instanceof Element && event.target.closest('a[href]') !== null) close();
  };
  const onPanelKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (open && event.key === 'Tab') trapTab(event, panelRef.current);
  };

  return { state, panelRef, onPanelClick, onPanelKeyDown };
}
