'use client';

import { Button } from './Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Dialog';

import type { ReactNode } from 'react';

/** Tavsif bo'lmasa Radix ogohlantirishini o'chirish uchun `aria-describedby` aniq bo'shatiladi. */
const NO_DESCRIPTION = { 'aria-describedby': undefined } as const;

export type ConfirmDialogVariant = 'primary' | 'danger';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` — qaytarib bo'lmaydigan amallar (deaktivatsiya, tokenni bekor qilish). */
  variant?: ConfirmDialogVariant;
  /** So'rov ketayotganda: tasdiqlash tugmasi spinner bilan, oyna yopilmaydi. */
  loading?: boolean;
  onConfirm: () => void;
  /** Qo'shimcha mazmun (masalan, xato `Alert`i). */
  children?: ReactNode;
}

/**
 * Tasdiqlash oynasi (boshqariladigan: `open` + `onOpenChange`). Muvaffaqiyatdan keyin oynani
 * chaqiruvchi yopadi (`onOpenChange(false)`) — `onConfirm` o'zi yopmaydi.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Tasdiqlash',
  cancelLabel = 'Bekor qilish',
  variant = 'primary',
  loading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!loading) onOpenChange(next);
      }}
    >
      <DialogContent
        size="sm"
        hideCloseButton
        role="alertdialog"
        {...(description === undefined ? NO_DESCRIPTION : {})}
      >
        <DialogHeader className="pr-0">
          <DialogTitle>{title}</DialogTitle>
          {description !== undefined ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={loading}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button variant={variant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
