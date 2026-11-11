import { cn } from '@/lib/cn';

import { toneClasses } from './classes';

import type { StatusTone } from './classes';
import type { HTMLAttributes } from 'react';

export type BadgeVariant = 'neutral' | StatusTone;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-border bg-surface-muted text-text-muted',
  ...toneClasses,
};

/** Kichik holat belgisi (ACTIVE/INACTIVE, ARCHIVED ...). Ma'no faqat rangda emas — matnda ham. */
export function Badge({ variant = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  );
}
