'use client';

import { useRef } from 'react';

import { cn } from '@/lib/cn';

import { focusRing } from './classes';
import { Input } from './Input';

import type { InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: string;
  /** Har bir o'zgarishda chaqiriladi (debounce — feature hook'ida, komponentda emas). */
  onValueChange: (value: string) => void;
  clearLabel?: string;
}

/** Qidiruv maydoni: `type="search"`, qiymat bo'lsa "Tozalash" tugmasi. */
export function SearchInput({
  value,
  onValueChange,
  clearLabel = 'Tozalash',
  disabled,
  className,
  ...rest
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value !== '';

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        className={cn('[&::-webkit-search-cancel-button]:hidden', hasValue && 'pr-24', className)}
        {...rest}
      />
      {hasValue ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onValueChange('');
            inputRef.current?.focus();
          }}
          className={cn(
            'absolute inset-y-0 right-0 rounded-md px-3 text-sm text-text-muted hover:text-text disabled:cursor-not-allowed disabled:text-text-disabled',
            focusRing,
          )}
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}
