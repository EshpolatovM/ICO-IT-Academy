import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantik daraja; o'lcham undan olinadi. */
  as?: HeadingLevel;
}

const levelClasses: Record<HeadingLevel, string> = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-semibold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
};

/** Sarlavha (tipografiya token'lari bilan). */
export function Heading({ as: Tag = 'h2', className, ...rest }: HeadingProps) {
  return <Tag className={cn('text-text', levelClasses[Tag], className)} {...rest} />;
}
