'use client';

import { useEffect, useRef, useState } from 'react';

import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from './useDebouncedValue';

/**
 * Qidiruv maydoni: kiritish darhol ko'rinadi, URL'dagi `q` esa debounce bilan yangilanadi.
 * `q` tashqaridan o'zgarsa (orqaga qaytish) — maydon ham yangilanadi, so'rov qayta yuborilmaydi.
 */
export function useSearchField(q: string, onSearch: (value: string) => void) {
  const [value, setValue] = useState(q);
  const debounced = useDebouncedValue(value, SEARCH_DEBOUNCE_MS);
  const lastDebounced = useRef(debounced);

  useEffect(() => {
    setValue((current) => (current.trim() === q.trim() ? current : q));
  }, [q]);

  useEffect(() => {
    if (debounced === lastDebounced.current) {
      return;
    }
    lastDebounced.current = debounced;
    if (debounced.trim() !== q.trim()) {
      onSearch(debounced);
    }
  }, [debounced, q, onSearch]);

  return { value, setValue };
}
