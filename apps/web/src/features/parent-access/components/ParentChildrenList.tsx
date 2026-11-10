'use client';

import { Alert, EmptyState, Spinner, Stack } from '@/components/ui';

import { useParentChildren } from '../hooks/useParentChildren';

import { ParentChildCard } from './ParentChildCard';

/** Farzandlar kartochkalari: yuklanish, xato va bo'sh holatlari bilan. */
export function ParentChildrenList() {
  const { data: children, isPending, isError } = useParentChildren();

  if (isPending) {
    return <Spinner />;
  }
  if (isError) {
    return <Alert variant="danger">Farzandlar ro&apos;yxatini yuklab bo&apos;lmadi.</Alert>;
  }
  if (children.length === 0) {
    return (
      <EmptyState
        title="Farzandlar yo'q"
        description="Kirish kodi orqali farzandingizni qo'shing."
      />
    );
  }
  return (
    <Stack gap="4">
      {children.map((child) => (
        <ParentChildCard key={child.studentId} child={child} />
      ))}
    </Stack>
  );
}
