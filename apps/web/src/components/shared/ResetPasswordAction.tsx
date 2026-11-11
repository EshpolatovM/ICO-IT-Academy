'use client';

import { useState } from 'react';

import type { PasswordResetResponse } from '@lms/shared';

import { Alert, Button, ConfirmDialog } from '@/components/ui';
import type { ButtonSize, DescriptionItem } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { useSecretMutation } from '@/lib/hooks';

import { SecretResultDialog, temporaryPasswordSecrets } from './SecretResultDialog';

import type { QueryKey } from '@tanstack/react-query';

export interface ResetPasswordActionProps {
  userId: string;
  userName: string;
  /** Natija oynasida login ma'lumoti (ID yoki telefon). */
  loginItem: DescriptionItem;
  /** Endpoint chaqiruvi (`/students/:id/reset-password` yoki `/staff/:id/reset-password`). */
  reset: (id: string) => Promise<PasswordResetResponse>;
  /** Muvaffaqiyatdan so'ng bekor qilinadigan query'lar (javob keshga yozilmaydi). */
  invalidateKey?: QueryKey;
  size?: ButtonSize;
}

/** Parolni tiklash: tasdiqlash → yangi vaqtinchalik parol (BIR MARTA, keshsiz). */
export function ResetPasswordAction({
  userId,
  userName,
  loginItem,
  reset,
  invalidateKey,
  size = 'sm',
}: ResetPasswordActionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { run, result, clear, isPending, error } = useSecretMutation(reset, invalidateKey);

  const changeOpen = (next: boolean) => {
    clear();
    setConfirmOpen(next);
  };
  const close = () => {
    changeOpen(false);
  };
  const openConfirm = () => {
    changeOpen(true);
  };

  return (
    <>
      <Button variant="secondary" size={size} onClick={openConfirm}>
        Parolni tiklash
      </Button>
      <ConfirmDialog
        open={confirmOpen && result === null}
        onOpenChange={changeOpen}
        title={`${userName}: parol tiklansinmi?`}
        description="Yangi vaqtinchalik parol yaratiladi, eski parol va barcha sessiyalar bekor bo'ladi. Foydalanuvchi keyingi kirishda parolni almashtiradi."
        confirmLabel="Tiklash"
        loading={isPending}
        onConfirm={() => {
          run(userId).catch(() => undefined);
        }}
      >
        {error !== null ? <Alert variant="danger">{errorMessage(error)}</Alert> : null}
      </ConfirmDialog>
      {result !== null ? (
        <SecretResultDialog
          title="Parol tiklandi"
          items={[{ term: 'Ism-familiya', value: userName }, loginItem]}
          secrets={temporaryPasswordSecrets(result.temporaryPassword)}
          onDone={close}
        />
      ) : null}
    </>
  );
}
