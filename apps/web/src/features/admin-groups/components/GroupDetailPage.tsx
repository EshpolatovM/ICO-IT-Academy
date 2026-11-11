'use client';

import type { AdminGroupDetail } from '@lms/shared';

import { QueryView } from '@/components/shared';
import { PageHeader, Stack } from '@/components/ui';

import { useGroup } from '../hooks/useGroupQueries';
import { AdminGroupsPath } from '../lib/admin-groups-paths';

import { GroupEditCard } from './GroupEditCard';
import { GroupInfoCard } from './GroupInfoCard';
import { GroupMembersCard } from './GroupMembersCard';
import { GroupMentorCard } from './GroupMentorCard';
import { GroupStatusAction } from './GroupStatusAction';
import { GroupStatusBadge } from './GroupStatusBadge';

const BACK_LINK = { href: AdminGroupsPath.GROUPS, label: 'Guruhlar' } as const;

function GroupDetailContent({ group }: { group: AdminGroupDetail }) {
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

/** `/admin/groups/[id]` — ma'lumotlar, tahrirlash, arxivlash, mentor, a'zolar. */
export function GroupDetailPage({ id }: { id: string }) {
  return (
    <QueryView query={useGroup(id)} notFoundTitle="Guruh topilmadi" back={BACK_LINK}>
      {(group) => <GroupDetailContent group={group} />}
    </QueryView>
  );
}
