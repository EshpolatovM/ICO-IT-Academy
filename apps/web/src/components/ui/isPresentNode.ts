import type { ReactNode } from 'react';

/** Ixtiyoriy ReactNode prop haqiqatan berilganmi (`undefined`/`null`/`false` emas). */
export function isPresentNode(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}
