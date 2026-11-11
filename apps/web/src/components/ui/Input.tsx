import { cn } from '@/lib/cn';

import { fieldBase, fieldInvalid, focusRing } from './classes';

import type { InputHTMLAttributes, Ref } from 'react';

export type InputType = 'text' | 'password' | 'tel' | 'number' | 'search';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  /** Xato holati: qizil chegara va `aria-invalid`. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/** Bir qatorli matn kiritish maydoni. */
export function Input({ type = 'text', invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, focusRing, invalid && fieldInvalid, className)}
      {...rest}
    />
  );
}
