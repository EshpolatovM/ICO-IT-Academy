import Link from 'next/link';

import { Container, Heading, Stack } from '@/components/ui';
import { AuthPath } from '@/features/auth';

export default function HomePage() {
  return (
    <main>
      <Container className="py-8">
        <Stack gap="4">
          <Heading as="h1">ICO IT Academy</Heading>
          <nav aria-label="Kirish sahifalari">
            <Stack gap="2">
              <Link href={AuthPath.STUDENT_LOGIN}>Student kirishi</Link>
              <Link href={AuthPath.STAFF_LOGIN}>Xodimlar kirishi</Link>
              <Link href="/parent">Ota-ona kirishi</Link>
            </Stack>
          </nav>
        </Stack>
      </Container>
    </main>
  );
}
