'use client';

import { QueryErrorAlert } from '@/components/shared';
import { PageHeader, Stack } from '@/components/ui';

import { useAdminPaths } from '../hooks/useAdminContentQueries';

import { CreatePathDialog } from './PathDialogs';
import { PathsTable } from './PathsTable';

const PUBLISH_HINT =
  "Nashr kaskad qilmaydi: student faqat yo'l, bo'lim, mavzu va dars — hammasi nashr qilingan kontentni ko'radi.";

/** `/admin/paths` (SA, A) — docs/03 §4 "Ilm yo'llari": ro'yxat, yaratish, nashr, o'chirish. */
export function PathsPage() {
  const paths = useAdminPaths();
  return (
    <Stack gap="6">
      <PageHeader title="Ilm yo'llari" description={PUBLISH_HINT} actions={<CreatePathDialog />} />
      {paths.isError ? (
        <QueryErrorAlert error={paths.error} onRetry={() => void paths.refetch()} />
      ) : null}
      <PathsTable items={paths.data?.items} isLoading={paths.isPending} />
    </Stack>
  );
}
