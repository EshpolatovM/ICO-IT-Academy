import { PARENT_LINK_PATH } from '@lms/shared';

import { Container, Heading, Stack, TextLink } from '@/components/ui';
import { AuthPath } from '@/features/auth';

export default function HomePage() {
  return (
    <main>
      <Container className="py-8">
        <Stack gap="4">
          <Heading as="h1">ICO IT Academy</Heading>
          <nav aria-label="Kirish sahifalari">
            <Stack gap="2">
              <TextLink href={AuthPath.STUDENT_LOGIN}>Student kirishi</TextLink>
              <TextLink href={AuthPath.STAFF_LOGIN}>Xodimlar kirishi</TextLink>
              <TextLink href={PARENT_LINK_PATH}>Ota-ona kirishi</TextLink>
            </Stack>
          </nav>
        </Stack>
      </Container>
    </main>
  );
}
