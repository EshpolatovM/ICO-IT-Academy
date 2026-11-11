'use client';

import { PageHeader, Pagination, Stack } from '@/components/ui';

import { useGroupListUrlState } from '../hooks/useGroupListUrlState';
import { useGroupList } from '../hooks/useGroupQueries';

import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupListTable } from './GroupListTable';
import { GroupListToolbar } from './GroupListToolbar';
import { GroupQueryError } from './GroupQueryError';

/** `/admin/groups` (SA, A) — docs/03 §4: ro'yxat, filtrlar, pagination, yaratish. */
export function GroupsPage() {
  const { state, patch } = useGroupListUrlState();
  const list = useGroupList(state);
  const filtered =
    state.q !== '' ||
    state.status !== undefined ||
    state.pathId !== undefined ||
    state.mentorId !== undefined;

  return (
    <Stack gap="6">
      <PageHeader title="Guruhlar" actions={<CreateGroupDialog />} />
      <GroupListToolbar state={state} onChange={patch} />
      {list.isError ? (
        <GroupQueryError error={list.error} onRetry={() => void list.refetch()} />
      ) : null}
      <GroupListTable items={list.data?.items} isLoading={list.isPending} filtered={filtered} />
      {list.data !== undefined && list.data.total > 0 ? (
        <Pagination
          page={list.data.page}
          pageSize={list.data.pageSize}
          total={list.data.total}
          onPageChange={(page) => {
            patch({ page });
          }}
        />
      ) : null}
    </Stack>
  );
}
