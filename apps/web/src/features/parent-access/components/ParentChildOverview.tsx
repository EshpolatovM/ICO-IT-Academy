'use client';

import { EmptyState, Heading, Spinner, Stack } from '@/components/ui';

import { useParentChildren } from '../hooks/useParentChildren';

/** `/parent/:studentId` — farzand paneli (14-bosqichda to'ldiriladi). */
export function ParentChildOverview({ studentId }: { studentId: string }) {
  const { data: children, isPending } = useParentChildren();
  if (isPending) {
    return <Spinner />;
  }
  const child = children?.find((item) => item.studentId === studentId);
  if (child === undefined) {
    return (
      <EmptyState title="Farzand topilmadi" description="Bu farzand sizning ro'yxatingizda yo'q." />
    );
  }
  return (
    <Stack gap="6">
      <Heading as="h1">
        {child.firstName} {child.lastName}
      </Heading>
      <EmptyState title="Tez orada" description="Farzand paneli 14-bosqichda qo'shiladi." />
    </Stack>
  );
}
