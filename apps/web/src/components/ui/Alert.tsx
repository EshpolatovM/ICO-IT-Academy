import { cn } from '@/lib/cn';

import { toneClasses } from './classes';

import type { StatusTone } from './classes';
import type { ReactNode } from 'react';

export type AlertVariant = StatusTone;

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}

/** Xabar bloki. `danger`/`warning` — `role="alert"` (darhol o'qiladi), qolganlari — `role="status"`. */
export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const role = variant === 'danger' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={cn('rounded-md border px-4 py-3 text-sm', toneClasses[variant], className)}
    >
      {title !== undefined ? <p className="font-semibold">{title}</p> : null}
      {children !== undefined ? <div className="text-text">{children}</div> : null}
    </div>
  );
}
