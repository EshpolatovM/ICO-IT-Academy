import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-info bg-info-bg text-info',
  success: 'border-success bg-success-bg text-success',
  warning: 'border-warning bg-warning-bg text-warning',
  danger: 'border-danger bg-danger-bg text-danger',
};

/** Xabar bloki. `danger`/`warning` — `role="alert"` (darhol o'qiladi), qolganlari — `role="status"`. */
export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const role = variant === 'danger' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={cn('rounded-md border px-4 py-3 text-sm', variantClasses[variant], className)}
    >
      {title !== undefined ? <p className="font-semibold">{title}</p> : null}
      {children !== undefined ? <div className="text-text">{children}</div> : null}
    </div>
  );
}
