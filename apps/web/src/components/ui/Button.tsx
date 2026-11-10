import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/cn';

import { focusRing } from './classes';
import { Spinner } from './Spinner';

import type { ButtonHTMLAttributes, Ref } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Yuklanayotganda tugma bloklanadi va spinner ko'rsatiladi. */
  loading?: boolean;
  fullWidth?: boolean;
  /** Bitta bola elementni (masalan `Link`) tugma ko'rinishida chiqarish. */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'border border-border bg-bg text-text hover:bg-surface-muted',
  ghost: 'text-text hover:bg-surface-muted',
  danger: 'bg-danger text-primary-fg hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium disabled:cursor-not-allowed disabled:opacity-50';

type NativeButtonProps = Omit<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'asChild'>;

/** Oddiy `<button>`: loading holatida bloklanadi va spinner ko'rsatadi. */
function NativeButton({ loading = false, disabled, type, children, ...rest }: NativeButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}

/** Asosiy tugma. */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  asChild = false,
  className,
  ...rest
}: ButtonProps) {
  const classes = cn(
    baseClasses,
    focusRing,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );

  if (asChild) {
    const { loading: _loading, ...slotProps } = rest;
    return <Slot className={classes} {...slotProps} />;
  }

  return <NativeButton className={classes} {...rest} />;
}
