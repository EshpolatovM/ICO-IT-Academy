import { Stack, Text, TextLink } from '@/components/ui';
import { AuthCard, AuthGuard, AuthPath, LoginForm } from '@/features/auth';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Xodimlar kirishi — ICO IT Academy' };

/** Admin/mentor kirishi: telefon + parol (docs/03 §1). */
export default function StaffLoginPage() {
  return (
    <AuthGuard area="guest">
      <Stack gap="4">
        <AuthCard title="Xodimlar kirishi" description="Telefon raqam va parolingizni kiriting.">
          <LoginForm kind="staff" />
        </AuthCard>
        <Text variant="muted">
          Studentmisiz? <TextLink href={AuthPath.STUDENT_LOGIN}>Student ID bilan kirish</TextLink>
        </Text>
      </Stack>
    </AuthGuard>
  );
}
