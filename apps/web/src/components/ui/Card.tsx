import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;

/** Oddiy karta: chegara, oq fon, kichik soya. */
export function Card({ className, ...rest }: DivProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-bg shadow-sm', className)} {...rest} />
  );
}

export function CardHeader({ className, ...rest }: DivProps) {
  return <div className={cn('flex flex-col gap-1 p-4', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-text', className)} {...rest} />;
}

export function CardContent({ className, ...rest }: DivProps) {
  return <div className={cn('px-4 pb-4', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: DivProps) {
  return (
    <div
      className={cn('flex items-center gap-2 border-t border-border-muted p-4', className)}
      {...rest}
    />
  );
}
