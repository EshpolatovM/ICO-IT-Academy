import { cn } from '@/lib/cn';

import { Button } from './Button';
import { getPaginationItems } from './paginationRange';

import type { PaginationItem } from './paginationRange';

export interface PaginationProps {
  /** Joriy sahifa (1 dan boshlab). */
  page: number;
  pageSize: number;
  /** Jami natijalar soni. */
  total: number;
  onPageChange: (page: number) => void;
  /** `nav` uchun nom (bir sahifada bir nechta pagination bo'lsa farqlash uchun). */
  label?: string;
  className?: string;
}

/** Jami sahifalar soni (kamida 1). */
export function getPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

interface PageItemProps {
  item: PaginationItem;
  page: number;
  onPageChange: (page: number) => void;
}

function PageItem({ item, page, onPageChange }: PageItemProps) {
  if (typeof item !== 'number') {
    return (
      <span aria-hidden="true" className="px-2 text-sm text-text-muted">
        …
      </span>
    );
  }

  const current = item === page;
  return (
    <Button
      variant={current ? 'primary' : 'ghost'}
      size="sm"
      aria-current={current ? 'page' : undefined}
      aria-label={`${item}-sahifa`}
      onClick={() => {
        onPageChange(item);
      }}
    >
      {item}
    </Button>
  );
}

/** Oldingi/keyingi + sahifa raqamlari (ko'p bo'lsa "…" bilan qisqartirilgan) + "N ta natija". */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  label = 'Sahifalash',
  className,
}: PaginationProps) {
  const pageCount = getPageCount(total, pageSize);

  return (
    <nav
      aria-label={label}
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
    >
      <p className="text-sm text-text-muted">{total} ta natija</p>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              onPageChange(page - 1);
            }}
          >
            Oldingi
          </Button>
        </li>
        {getPaginationItems(page, pageCount).map((item) => (
          <li key={item}>
            <PageItem item={item} page={page} onPageChange={onPageChange} />
          </li>
        ))}
        <li>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => {
              onPageChange(page + 1);
            }}
          >
            Keyingi
          </Button>
        </li>
      </ul>
    </nav>
  );
}
