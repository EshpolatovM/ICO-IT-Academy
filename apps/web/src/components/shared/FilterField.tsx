'use client';

import { FormField } from '@/components/ui';
import type { FormFieldProps } from '@/components/ui';

/**
 * Ro'yxat filtrlari kengligi — bitta joyda (Tailwind shkalasi token'lari):
 * `narrow` — qisqa tanlov (holat), `wide` — qidiruvli tanlov, `fill` — qolgan joy (qidiruv).
 */
const FILTER_FIELD_WIDTH = {
  narrow: 'w-48',
  wide: 'w-64',
  fill: 'min-w-64 flex-1',
} as const;

export type FilterFieldWidth = keyof typeof FILTER_FIELD_WIDTH;

export interface FilterFieldProps extends Omit<FormFieldProps, 'className'> {
  width: FilterFieldWidth;
}

/** Filtr paneli maydoni: `FormField` + bir xil kenglik. */
export function FilterField({ width, ...props }: FilterFieldProps) {
  return <FormField {...props} className={FILTER_FIELD_WIDTH[width]} />;
}
