import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Masalan, tugma. */
  action?: ReactNode;
  className?: string;
}

/** Bo'sh sahifa/bo'lim uchun oddiy matn bloki. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-base font-semibold text-text">{title}</p>
      {description !== undefined ? <p className="text-sm text-text-muted">{description}</p> : null}
      {action !== undefined ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
