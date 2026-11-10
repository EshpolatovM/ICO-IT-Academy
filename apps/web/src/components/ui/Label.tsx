import { cn } from '@/lib/cn';

import type { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Majburiy maydon belgisi (`*`), ekran o'quvchilar uchun "majburiy" matni bilan. */
  required?: boolean;
}

/** Forma maydoni yorlig'i. */
export function Label({ required = false, className, children, ...rest }: LabelProps) {
  return (
    <label className={cn('block text-sm font-medium text-text', className)} {...rest}>
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
          <span className="sr-only"> (majburiy)</span>
        </>
      ) : null}
    </label>
  );
}
