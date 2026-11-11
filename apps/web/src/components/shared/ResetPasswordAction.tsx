'use client';

import type { PasswordResetResponse } from '@lms/shared';

import type { ButtonSize, DescriptionItem } from '@/components/ui';

import { ConfirmSecretAction } from './ConfirmSecretAction';
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
  size,
}: ResetPasswordActionProps) {
  return (
    <ConfirmSecretAction
      label="Parolni tiklash"
      size={size}
      confirmTitle={`${userName}: parol tiklansinmi?`}
      confirmDescription="Yangi vaqtinchalik parol yaratiladi, eski parol va barcha sessiyalar bekor bo'ladi. Foydalanuvchi keyingi kirishda parolni almashtiradi."
      confirmLabel="Tiklash"
      action={() => reset(userId)}
      invalidateKey={invalidateKey}
      renderResult={(result, onDone) => (
        <SecretResultDialog
          title="Parol tiklandi"
          items={[{ term: 'Ism-familiya', value: userName }, loginItem]}
          secrets={temporaryPasswordSecrets(result.temporaryPassword)}
          onDone={onDone}
        />
      )}
    />
  );
}
