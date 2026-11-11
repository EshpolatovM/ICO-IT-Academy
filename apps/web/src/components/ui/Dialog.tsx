'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/lib/cn';

import { Button } from './Button';

import type { ComponentProps, HTMLAttributes } from 'react';

/** Modal oyna ildizi (`open`/`onOpenChange` yoki `defaultOpen`). Radix Dialog asosida. */
export const Dialog = DialogPrimitive.Root;
/** Ochuvchi element; odatda `<DialogTrigger asChild><Button>…</Button></DialogTrigger>`. */
export const DialogTrigger = DialogPrimitive.Trigger;
/** Yopuvchi element; odatda `<DialogClose asChild><Button>…</Button></DialogClose>`. */
export const DialogClose = DialogPrimitive.Close;

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  size?: DialogSize;
  /** Yuqori o'ng burchakdagi "Yopish" tugmasi matni. */
  closeLabel?: string;
  hideCloseButton?: boolean;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Oyna mazmuni: portal + oddiy qoplama (blur yo'q) + markazdagi karta.
 * Fokus tuzog'i, Esc, `aria-labelledby`/`aria-describedby` — Radix tomonidan.
 * `DialogDescription` bo'lmasa `aria-describedby={undefined}` bering.
 */
export function DialogContent({
  size = 'md',
  closeLabel = 'Yopish',
  hideCloseButton = false,
  className,
  children,
  ...rest
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-text/50 p-4">
        <DialogPrimitive.Content
          className={cn(
            'relative flex w-full flex-col gap-4 rounded-lg border border-border bg-bg p-6 shadow-sm',
            sizeClasses[size],
            className,
          )}
          {...rest}
        >
          {children}
          {hideCloseButton ? null : (
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="sm" className="absolute top-3 right-3">
                {closeLabel}
              </Button>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 pr-20', className)} {...rest} />;
}

export function DialogTitle({ className, ...rest }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn('text-lg font-semibold text-text', className)} {...rest} />
  );
}

export function DialogDescription({
  className,
  ...rest
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('text-sm text-text-muted', className)} {...rest} />
  );
}

/** Pastki tugmalar qatori: tor ekranda ustma-ust, kengda o'ngga tekislangan. */
export function DialogFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...rest}
    />
  );
}
