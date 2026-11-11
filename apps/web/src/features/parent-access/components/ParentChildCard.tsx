import Link from 'next/link';

import type { ParentChild } from '@lms/shared';

import { Button, Card, CardFooter, CardHeader, CardTitle, Text } from '@/components/ui';

/** Farzand kartochkasi: ism, guruh va panelga o'tish. */
export function ParentChildCard({ child }: { child: ParentChild }) {
  return (
    <Card data-testid="parent-child-card">
      <CardHeader>
        <CardTitle>
          {child.firstName} {child.lastName}
        </CardTitle>
        <Text variant="muted">Guruh: {child.groupName ?? '—'}</Text>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/parent/${child.studentId}`}>Ko&apos;rish</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
