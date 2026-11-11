'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';

import { focusRing } from './classes';
import { Input } from './Input';

import type { InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showLabel?: string;
  hideLabel?: string;
}

/** Parol maydoni: matnni ko'rsatish/yashirish tugmasi bilan. */
export function PasswordInput({
  showLabel = "Ko'rsatish",
  hideLabel = 'Yashirish',
  className,
  disabled,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('pr-24', className)}
        disabled={disabled}
        {...rest}
      />
      <button
        type="button"
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => {
          setVisible((value) => !value);
        }}
        className={cn(
          'absolute inset-y-0 right-0 rounded-md px-3 text-sm text-text-muted hover:text-text disabled:cursor-not-allowed disabled:text-text-disabled',
          focusRing,
        )}
      >
        {visible ? hideLabel : showLabel}
      </button>
    </div>
  );
}
