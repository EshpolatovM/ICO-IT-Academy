'use client';

import { Alert, Stack } from '@/components/ui';

import { useCurrentUser } from '../hooks/useCurrentUser';

import { AuthCard } from './AuthCard';
import { AuthGuard } from './AuthGuard';
import { ChangePasswordForm } from './ChangePasswordForm';
import { LogoutButton } from './LogoutButton';

function ChangePasswordContent() {
  const mandatory = useCurrentUser()?.mustChangePassword === true;
  return (
    <Stack gap="4">
      {mandatory ? (
        <Alert variant="warning" title="Parolni almashtirish majburiy">
          Davom etish uchun vaqtinchalik parolni o&apos;zingizning yangi parolingizga almashtiring.
        </Alert>
      ) : null}
      <AuthCard title="Parolni almashtirish">
        <ChangePasswordForm />
      </AuthCard>
      <Stack direction="horizontal" justify="end">
        <LogoutButton />
      </Stack>
    </Stack>
  );
}

/**
 * `/change-password` (docs/03 §1). `mustChangePassword` bo'lsa majburiy: guard boshqa barcha
 * himoyalangan sahifalardan shu yerga qaytaradi, bu yerdan faqat "Chiqish" mumkin.
 */
export function ChangePasswordPage() {
  return (
    <AuthGuard area="change-password">
      <ChangePasswordContent />
    </AuthGuard>
  );
}
