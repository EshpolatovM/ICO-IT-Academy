import { Container } from '@/components/ui';

import type { ReactNode } from 'react';

/** `AuthLayout` (docs/03 §0): login formalari markazda. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-surface">
      <Container size="sm" className="py-12">
        {children}
      </Container>
    </main>
  );
}
