'use client';

import { useEffect, useState } from 'react';

/** Qidiruvdan so'rovgacha kutish (ms). */
export const SEARCH_DELAY_MS = 300;

/** `value` `delayMs` davomida o'zgarmasa — qaytariladi (qidiruv so'rovlari uchun). */
export function useDebouncedValue<T>(value: T, delayMs: number = SEARCH_DELAY_MS): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(setSettled, delayMs, value);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);
  return settled;
}
