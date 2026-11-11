import { cn } from '@/lib/cn';

import { fieldBase, fieldInvalid, focusRing } from './classes';

import type { Ref, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Xato holati: qizil chegara va `aria-invalid`. */
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

/** Ko'p qatorli matn maydoni (Input bilan bir xil uslub). */
export function Textarea({ invalid = false, rows = 4, className, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, focusRing, 'resize-y', invalid && fieldInvalid, className)}
      {...rest}
    />
  );
}
