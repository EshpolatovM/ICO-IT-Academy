import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

/** Tailwind standart konteyner kengliklari. */
const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
};

/** Kontentni markazlab, maksimal kenglik va yon bo'shliq beradi. */
export function Container({ size = 'lg', className, ...rest }: ContainerProps) {
  return <div className={cn('mx-auto w-full px-4', sizeClasses[size], className)} {...rest} />;
}
