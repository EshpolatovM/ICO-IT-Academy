import Link from 'next/link';

import { cn } from '@/lib/cn';

import { focusRing } from './classes';

import type { ComponentProps } from 'react';

export type TextLinkVariant = 'default' | 'muted';

export interface TextLinkProps extends Omit<ComponentProps<typeof Link>, 'target' | 'rel'> {
  variant?: TextLinkVariant;
  /** Tashqi havola: yangi oynada ochiladi (`target="_blank"`, `rel="noopener noreferrer"`). */
  external?: boolean;
}

const variantClasses: Record<TextLinkVariant, string> = {
  default: 'text-primary hover:underline',
  muted: 'text-text-muted hover:text-text hover:underline',
};

/** Matn ichidagi havola (`next/link` asosida). */
export function TextLink({
  variant = 'default',
  external = false,
  className,
  ...rest
}: TextLinkProps) {
  return (
    <Link
      className={cn('rounded-sm underline-offset-2', focusRing, variantClasses[variant], className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    />
  );
}
