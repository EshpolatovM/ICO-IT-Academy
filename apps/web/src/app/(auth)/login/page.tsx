import Link from 'next/link';

import { Stack, Text } from '@/components/ui';
import { AuthCard, AuthGuard, AuthPath, LoginForm } from '@/features/auth';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Kirish — ICO IT Academy' };

/** Student kirishi: ID + parol (docs/03 §1). */
export default function StudentLoginPage() {
  return (
    <AuthGuard area="guest">
      <Stack gap="4">
        <AuthCard title="Kirish" description="Student ID va parolingizni kiriting.">
          <LoginForm kind="student" />
        </AuthCard>
        <Text variant="muted">
          Xodimmisiz? <Link href={AuthPath.STAFF_LOGIN}>Telefon raqam bilan kirish</Link>
        </Text>
        <Text variant="muted">
          Ota-onamisiz? <Link href="/parent">Ota-ona kirishi</Link>
        </Text>
      </Stack>
    </AuthGuard>
  );
}
