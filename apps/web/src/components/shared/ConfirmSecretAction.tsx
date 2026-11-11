'use client';

import { useState } from 'react';

import { Alert, Button, ConfirmDialog } from '@/components/ui';
import type { ButtonSize, ButtonVariant } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { useSecretMutation } from '@/lib/hooks';

import type { QueryKey } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface ConfirmSecretActionProps<TResult> {
  /** Tugma matni ("Parolni tiklash"). */
  label: string;
  /** Jadval qatorida tugmani farqlash uchun (`"Onasi — qayta yaratish"`). */
  ariaLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  /** Tasdiqlangach chaqiriladigan so'rov; javobida bir martalik maxfiy qiymat. */
  action: () => Promise<TResult>;
  /** Muvaffaqiyatdan so'ng bekor qilinadigan query'lar (javob keshga yozilmaydi). */
  invalidateKey?: QueryKey;
  /** Natija oynasi; `onDone` — yopish va qiymatni xotiradan o'chirish. */
  renderResult: (result: TResult, onDone: () => void) => ReactNode;
}

/** Tasdiqlash oynasi holati; oyna ochilganda/yopilganda oldingi natija va xato tozalanadi. */
function useConfirmedSecret<TResult>(action: () => Promise<TResult>, invalidateKey?: QueryKey) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const secret = useSecretMutation(action, invalidateKey);
  const changeOpen = (next: boolean) => {
    secret.clear();
    setConfirmOpen(next);
  };
  return { ...secret, confirmOpen, changeOpen };
}

/**
 * "Tugma → tasdiqlash → bir martalik maxfiy natija" amali (parolni tiklash, ota-ona havolasini
 * qayta yaratish). Natija faqat komponent holatida (`useSecretMutation`), keshga yozilmaydi.
 */
export function ConfirmSecretAction<TResult>({
  label,
  ariaLabel,
  variant = 'secondary',
  size = 'sm',
  confirmTitle,
  confirmDescription,
  confirmLabel,
  action,
  invalidateKey,
  renderResult,
}: ConfirmSecretActionProps<TResult>) {
  const { run, result, isPending, error, confirmOpen, changeOpen } = useConfirmedSecret(
    action,
    invalidateKey,
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        aria-label={ariaLabel}
        onClick={() => {
          changeOpen(true);
        }}
      >
        {label}
      </Button>
      <ConfirmDialog
        open={confirmOpen && result === null}
        onOpenChange={changeOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        loading={isPending}
        onConfirm={() => {
          run(undefined).catch(() => undefined);
        }}
      >
        {error !== null ? <Alert variant="danger">{errorMessage(error)}</Alert> : null}
      </ConfirmDialog>
      {result !== null
        ? renderResult(result, () => {
            changeOpen(false);
          })
        : null}
    </>
  );
}
