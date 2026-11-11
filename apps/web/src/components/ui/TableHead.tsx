import { cn } from '@/lib/cn';

import { focusRing } from './classes';

import type { ThHTMLAttributes } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Joriy saralash yo'nalishi; `null` — bu ustun bo'yicha saralanmagan. */
  sortDirection?: SortDirection | null;
  /** Berilsa sarlavha saralash tugmasiga aylanadi va `aria-sort` qo'yiladi. */
  onSort?: () => void;
}

const ariaSortValues = {
  asc: 'ascending',
  desc: 'descending',
} as const satisfies Record<SortDirection, string>;

const sortIndicators: Record<SortDirection | 'none', string> = {
  asc: '▲',
  desc: '▼',
  none: '↕',
};

/** Ustun sarlavhasi; `onSort` bilan — saralanadigan (tugma + `aria-sort`). */
export function TableHead({
  sortDirection = null,
  onSort,
  scope = 'col',
  className,
  children,
  ...rest
}: TableHeadProps) {
  const sortable = onSort !== undefined;
  const ariaSort = sortable ? (sortDirection ? ariaSortValues[sortDirection] : 'none') : undefined;

  return (
    <th
      scope={scope}
      aria-sort={ariaSort}
      className={cn('px-3 py-2 font-medium whitespace-nowrap text-text-muted', className)}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn('inline-flex items-center gap-1 rounded-sm hover:text-text', focusRing)}
        >
          {children}
          <span aria-hidden="true" className="text-xs">
            {sortIndicators[sortDirection ?? 'none']}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}
