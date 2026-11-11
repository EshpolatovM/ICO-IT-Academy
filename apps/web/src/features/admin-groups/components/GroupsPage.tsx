'use client';

import { ListPagination, QueryErrorAlert } from '@/components/shared';
import { PageHeader, Stack } from '@/components/ui';

import { useGroupListUrlState } from '../hooks/useGroupListUrlState';
import { useGroupList } from '../hooks/useGroupQueries';

import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupListTable } from './GroupListTable';
import { GroupListToolbar } from './GroupListToolbar';

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
        <QueryErrorAlert error={list.error} onRetry={() => void list.refetch()} />
      ) : null}
      <GroupListTable items={list.data?.items} isLoading={list.isPending} filtered={filtered} />
      <ListPagination
        data={list.data}
        onPageChange={(page) => {
          patch({ page });
        }}
      />
    </Stack>
  );
}
