import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

export type TextVariant = 'body' | 'muted' | 'small' | 'danger';
export type TextElement = 'p' | 'span' | 'div';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextElement;
}

const variantClasses: Record<TextVariant, string> = {
  body: 'text-base text-text',
  muted: 'text-sm text-text-muted',
  small: 'text-xs text-text-muted',
  danger: 'text-sm text-danger',
};

/** Oddiy matn (tipografiya token'lari bilan). */
export function Text({ variant = 'body', as: Tag = 'p', className, ...rest }: TextProps) {
  return <Tag className={cn(variantClasses[variant], className)} {...rest} />;
}
