import type { Ref } from 'react';

/** Tashqi `ref` (funksiya yoki obyekt) ga DOM elementni yozadi — ichki ref bilan birlashtirish uchun. */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref !== null && ref !== undefined) {
    ref.current = node;
  }
}
