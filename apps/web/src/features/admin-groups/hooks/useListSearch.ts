'use client';

import { useEffect, useRef, useState } from 'react';

import { useDebouncedValue } from './useDebouncedValue';

/**
 * Ro'yxat qidiruvi: kiritish darhol ko'rinadi, URL'dagi `q` debounce bilan yangilanadi.
 * `q` tashqaridan o'zgarsa (orqaga qaytish) — maydon ham shunga keladi.
 */
export function useListSearch(q: string, onCommit: (q: string) => void) {
  const [text, setText] = useState(q);
  const settled = useDebouncedValue(text);
  const committed = useRef(settled);

  useEffect(() => {
    setText((current) => (current.trim() === q.trim() ? current : q));
  }, [q]);

  useEffect(() => {
    if (settled === committed.current) {
      return;
    }
    committed.current = settled;
    if (settled.trim() !== q.trim()) {
      onCommit(settled);
    }
  }, [settled, q, onCommit]);

  return { text, setText };
}
