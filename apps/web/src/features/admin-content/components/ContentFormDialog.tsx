'use client';

import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import type { ButtonSize, ButtonVariant } from '@/components/ui';

import type { ReactNode } from 'react';

export interface ContentFormDialogProps {
  title: string;
  triggerLabel: string;
  /** Daraxt qatorlarida bir xil nomli tugmalarni ajratish uchun ("Tahrirlash: HTML"). */
  triggerAriaLabel?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  /** Forma; `close` — muvaffaqiyatdan yoki "Bekor qilish"dan keyin oynani yopadi. */
  children: (close: () => void) => ReactNode;
}

/** Tugma + forma oynasi (yaratish/tahrirlash). Yopilganda forma unmount bo'ladi (holat tozalanadi). */
export function ContentFormDialog({
  title,
  triggerLabel,
  triggerAriaLabel,
  triggerVariant = 'secondary',
  triggerSize = 'sm',
  children,
}: ContentFormDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} aria-label={triggerAriaLabel}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children(() => {
          setOpen(false);
        })}
      </DialogContent>
    </Dialog>
  );
}
