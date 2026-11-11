import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export interface DescriptionItem {
  term: string;
  value: ReactNode;
}

export interface DescriptionListProps {
  items: readonly DescriptionItem[];
  /** Qiymat bo'sh (`null`, `undefined`, `''`) bo'lganda ko'rsatiladigan matn. */
  emptyValue?: string;
  className?: string;
}

function isEmptyValue(value: ReactNode): boolean {
  return value === null || value === undefined || value === '';
}

/** Profil/tafsilot sahifalari uchun "nom — qiymat" juftlari (`dl`). Tor ekranda ustma-ust. */
export function DescriptionList({ items, emptyValue = '—', className }: DescriptionListProps) {
  return (
    <dl className={cn('flex flex-col text-sm', className)}>
      {items.map((item) => (
        <div
          key={item.term}
          className="flex flex-col gap-1 border-b border-border-muted py-2 last:border-b-0 sm:flex-row sm:gap-4"
        >
          <dt className="text-text-muted sm:w-48 sm:shrink-0">{item.term}</dt>
          <dd className="text-text">{isEmptyValue(item.value) ? emptyValue : item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
