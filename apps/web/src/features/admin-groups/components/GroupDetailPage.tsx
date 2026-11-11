'use client';

import { ErrorCode } from '@lms/shared';

import { EmptyState, PageHeader, Spinner, Stack, TextLink } from '@/components/ui';
import { isApiError } from '@/lib/api';

import { useGroup } from '../hooks/useGroupQueries';
import { AdminGroupsPath } from '../lib/admin-groups-paths';

import { GroupEditCard } from './GroupEditCard';
import { GroupInfoCard } from './GroupInfoCard';
import { GroupMembersCard } from './GroupMembersCard';
import { GroupMentorCard } from './GroupMentorCard';
import { GroupQueryError } from './GroupQueryError';
import { GroupStatusAction } from './GroupStatusAction';
import { GroupStatusBadge } from './GroupStatusBadge';

const BACK_LINK = { href: AdminGroupsPath.GROUPS, label: 'Guruhlar' } as const;

function GroupLoadState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const notFound = isApiError(error) && error.code === ErrorCode.NOT_FOUND;
  return (
    <Stack gap="4">
      <TextLink href={BACK_LINK.href} variant="muted">
        ← {BACK_LINK.label}
      </TextLink>
      {notFound ? (
        <EmptyState title="Guruh topilmadi" description="U o'chirilgan yoki havola noto'g'ri." />
      ) : (
        <GroupQueryError error={error} onRetry={onRetry} />
      )}
    </Stack>
  );
}

/** `/admin/groups/[id]` — ma'lumotlar, tahrirlash, arxivlash, mentor, a'zolar. */
export function GroupDetailPage({ id }: { id: string }) {
  const query = useGroup(id);
  if (query.isPending) {
    return <Spinner />;
  }
  if (query.isError) {
    return <GroupLoadState error={query.error} onRetry={() => void query.refetch()} />;
  }
  const group = query.data;
  return (
    <Stack gap="6">
      <PageHeader
        back={BACK_LINK}
        title={group.name}
        titleAddon={<GroupStatusBadge status={group.status} />}
        actions={<GroupStatusAction group={group} />}
      />
      <GroupInfoCard group={group} />
      <GroupEditCard group={group} />
      <GroupMentorCard key={group.mentor?.id ?? 'none'} group={group} />
      <GroupMembersCard group={group} />
    </Stack>
  );
}
