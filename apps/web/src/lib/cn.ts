import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

/**
 * Semantik token nomlari Tailwind standart nomlari bilan to'qnashmasligi uchun tailwind-merge'ga
 * maxsus shrift o'lchamlari aytiladi (aks holda `text-sm` va `text-text-muted` bir guruh deb
 * hisoblanib, biri ikkinchisini o'chirib yuborishi mumkin).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'],
    },
  },
});

/** Tailwind klasslarini shartli birlashtiradi va to'qnashganlarini to'g'ri hal qiladi. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
