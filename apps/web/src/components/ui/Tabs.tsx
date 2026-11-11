'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/cn';

import { focusRing } from './classes';

import type { ComponentProps } from 'react';

/**
 * Tablar ildizi (`value`/`onValueChange` yoki `defaultValue`). Radix Tabs asosida:
 * `role=tablist/tab/tabpanel`, roving tabindex, strelkalar/Home/End.
 */
export function Tabs({ className, ...rest }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-4', className)} {...rest} />;
}

export function TabsList({ className, ...rest }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex gap-1 overflow-x-auto border-b border-border', className)}
      {...rest}
    />
  );
}

export function TabsTrigger({ className, ...rest }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        '-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap text-text-muted hover:text-text disabled:cursor-not-allowed disabled:text-text-disabled aria-selected:border-primary aria-selected:text-text',
        focusRing,
        className,
      )}
      {...rest}
    />
  );
}

export function TabsContent({ className, ...rest }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn(focusRing, 'rounded-sm', className)} {...rest} />;
}
