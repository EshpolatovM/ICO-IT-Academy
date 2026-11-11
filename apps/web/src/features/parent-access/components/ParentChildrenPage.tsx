'use client';

import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Stack,
} from '@/components/ui';
import { useParentSessionStore } from '@/stores/parent-session.store';

import { ParentChildrenList } from './ParentChildrenList';
import { ParentTokenForm } from './ParentTokenForm';

/** `/parent` — farzandlar kartochkalari va "Farzand qo'shish" (docs/03 §5, docs/10 §3). */
export function ParentChildrenPage() {
  const linkError = useParentSessionStore((state) => state.linkError);
  return (
    <Stack gap="6">
      <PageHeader title="Farzandlarim" />
      {linkError !== null ? <Alert variant="danger">{linkError}</Alert> : null}
      <ParentChildrenList />
      <Card>
        <CardHeader>
          <CardTitle>Farzand qo&apos;shish</CardTitle>
        </CardHeader>
        <CardContent>
          <ParentTokenForm submitLabel="Qo'shish" />
        </CardContent>
      </Card>
    </Stack>
  );
}
