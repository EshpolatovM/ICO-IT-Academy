'use client';

import type { MentorGroupItem } from '@lms/shared';

import { QueryView } from '@/components/shared';
import { PageHeader, Stack, StatCard } from '@/components/ui';
import { formatDateOnly } from '@/lib/format';

import { useMentorGroup, useMentorGroupStudents } from '../hooks/useMentorGroupQueries';
import { MentorPanelPath } from '../lib/mentor-panel-paths';

import { GroupStudentsTable } from './GroupStudentsTable';

const BACK_LINK = { href: MentorPanelPath.GROUPS, label: 'Guruhlar' } as const;

function GroupContent({ group }: { group: MentorGroupItem }) {
  const students = useMentorGroupStudents(group.id);
  return (
    <Stack gap="6">
      <PageHeader back={BACK_LINK} title={group.name} description={group.path.title} />
      <Stack direction="horizontal" gap="4" wrap>
        <StatCard label="Studentlar soni" value={group.studentsCount} />
        <StatCard label="Boshlanish sanasi" value={formatDateOnly(group.startsAt)} />
      </Stack>
      <QueryView query={students}>{(items) => <GroupStudentsTable students={items} />}</QueryView>
    </Stack>
  );
}

/** `/mentor/groups/[id]` — guruh va studentlar jadvali (docs/03 §3). */
export function MentorGroupDetailPage({ id }: { id: string }) {
  return (
    <QueryView query={useMentorGroup(id)} back={BACK_LINK} notFoundTitle="Guruh topilmadi">
      {(group) => <GroupContent group={group} />}
    </QueryView>
  );
}
