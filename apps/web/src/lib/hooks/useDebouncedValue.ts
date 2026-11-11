'use client';

import { useEffect, useState } from 'react';

/** Qidiruv yozilgandan keyin so'rov yuborilishigacha kutish (ms). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Qiymat `delayMs` davomida o'zgarmay tursa — yangilanadi (qidiruv uchun debounce). */
export function useDebouncedValue<T>(value: T, delayMs: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
