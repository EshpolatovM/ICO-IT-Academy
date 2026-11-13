'use client';

import { QueryView } from '@/components/shared';
import { PageHeader, Stack } from '@/components/ui';

import { usePathTree } from '../hooks/useAdminContentQueries';
import { ADMIN_PATHS_HOME } from '../lib/admin-content-paths';

import { ContentStatusBadge } from './ContentStatusBadge';
import { AddSectionDialog } from './NodeDialogs';
import { PathStatusToggle } from './PathStatusToggle';
import { PathTreeEditor } from './PathTreeEditor';

const BACK = { href: ADMIN_PATHS_HOME, label: "Ilm yo'llari" };

/** `/admin/paths/:id` — yo'l daraxti muharriri (SA, A), docs/03 §4. */
export function PathTreePage({ pathId }: { pathId: string }) {
  const tree = usePathTree(pathId);
  return (
    <QueryView query={tree} back={BACK} notFoundTitle="Yo'l topilmadi">
      {(data) => (
        <Stack gap="6">
          <PageHeader
            back={BACK}
            title={data.path.title}
            titleAddon={<ContentStatusBadge status={data.path.status} />}
            description="Holat har bir darajada alohida: yo'l nashr qilinsa ham, ichidagi qoralamalar studentga ko'rinmaydi."
            actions={
              <>
                <PathStatusToggle path={data.path} />
                <AddSectionDialog pathId={data.path.id} />
              </>
            }
          />
          <PathTreeEditor tree={data} />
        </Stack>
      )}
    </QueryView>
  );
}
