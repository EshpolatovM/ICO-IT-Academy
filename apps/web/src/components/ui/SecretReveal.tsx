'use client';

import { useId } from 'react';

import { cn } from '@/lib/cn';

import { Alert } from './Alert';
import { Button } from './Button';
import { useCopyToClipboard } from './useCopyToClipboard';

import type { CopyStatus } from './useCopyToClipboard';

export interface SecretRevealProps {
  /** Qiymat nomi, masalan "Vaqtinchalik parol" yoki "Ota-ona havolasi". */
  label: string;
  value: string;
  warning?: string;
  copyLabel?: string;
  copiedMessage?: string;
  copyErrorMessage?: string;
  className?: string;
}

const DEFAULT_WARNING =
  "Bu qiymat faqat hozir ko'rsatiladi. Uni nusxalab, xavfsiz joyga saqlang — keyin qayta ko'rib bo'lmaydi.";

function statusMessage(status: CopyStatus, copied: string, failed: string): string {
  if (status === 'copied') return copied;
  if (status === 'error') return failed;
  return '';
}

/** Maxfiy qiymatni (vaqtinchalik parol, ota-ona tokeni/havolasi) BIR MARTA ko'rsatish. */
export function SecretReveal({
  label,
  value,
  warning = DEFAULT_WARNING,
  copyLabel = 'Nusxa olish',
  copiedMessage = 'Nusxa olindi',
  copyErrorMessage = "Nusxa olib bo'lmadi — qiymatni qo'lda belgilab oling",
  className,
}: SecretRevealProps) {
  const labelId = useId();
  const { status, copy } = useCopyToClipboard();

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Alert variant="warning">{warning}</Alert>
      <div role="group" aria-labelledby={labelId} className="flex flex-col gap-1">
        <p id={labelId} className="text-sm font-medium text-text">
          {label}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="block flex-1 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm break-all text-text select-all">
            {value}
          </code>
          <Button
            variant="secondary"
            onClick={() => {
              void copy(value);
            }}
          >
            {copyLabel}
          </Button>
        </div>
        <p
          aria-live="polite"
          className={cn('text-xs', status === 'error' ? 'text-danger' : 'text-success')}
        >
          {statusMessage(status, copiedMessage, copyErrorMessage)}
        </p>
      </div>
    </div>
  );
}
