'use client';

import { Alert, Container, Stack } from '@/components/ui';
import { AuthCard } from '@/features/auth';
import { useParentSessionStore } from '@/stores/parent-session.store';

import { ParentTokenForm } from './ParentTokenForm';

/** Sessiya yo'q: kirish kodini kiritish (docs/03 §1 "Ota-ona kirishi"). */
export function ParentSignIn() {
  const linkError = useParentSessionStore((state) => state.linkError);
  return (
    <Container size="sm" className="py-12">
      <Stack gap="4">
        {linkError !== null ? <Alert variant="danger">{linkError}</Alert> : null}
        <AuthCard
          title="Ota-ona kirishi"
          description="Farzandingiz mentori bergan havolani oching yoki kirish kodini kiriting."
        >
          <ParentTokenForm submitLabel="Kirish" autoFocus />
        </AuthCard>
      </Stack>
    </Container>
  );
}
