'use client';

import { useState } from 'react';

import type { PasswordResetResponse } from '@lms/shared';

import { Alert, Button, ConfirmDialog } from '@/components/ui';
import type { ButtonSize, DescriptionItem } from '@/components/ui';

import { useSecretMutation } from '../hooks/useSecretMutation';

import { errorMessage } from './QueryErrorAlert';
import { SecretResultDialog } from './SecretResultDialog';

import type { ManagedUserKind } from '../types/admin-users.types';

export interface ResetPasswordActionProps {
  kind: ManagedUserKind;
  userId: string;
  userName: string;
  /** Natija oynasida login ma'lumoti (ID yoki telefon). */
  loginItem: DescriptionItem;
  reset: (id: string) => Promise<PasswordResetResponse>;
  size?: ButtonSize;
}

/** Parolni tiklash: tasdiqlash → yangi vaqtinchalik parol (BIR MARTA, keshsiz). */
export function ResetPasswordAction({
  kind,
  userId,
  userName,
  loginItem,
  reset,
  size = 'sm',
}: ResetPasswordActionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { run, result, clear, isPending, error } = useSecretMutation(kind, reset);

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
          temporaryPassword={result.temporaryPassword}
          onDone={close}
        />
      ) : null}
    </>
  );
}
