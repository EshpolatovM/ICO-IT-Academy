'use client';

import { QueryView } from '@/components/shared';
import { EmptyState, PageHeader, Stack } from '@/components/ui';

import { useMentorGroups } from '../hooks/useMentorGroupQueries';

import { MentorGroupsTable } from './MentorGroupsTable';

/** `/mentor/groups` — mentorning o'z faol guruhlari (docs/03 §3). */
export function MentorGroupsPage() {
  const query = useMentorGroups();
  return (
    <Stack gap="6">
      <PageHeader title="Guruhlar" description="Sizga biriktirilgan faol guruhlar." />
      <QueryView query={query}>
        {(groups) =>
          groups.length === 0 ? (
            <EmptyState
              title="Sizga hali guruh biriktirilmagan"
              description="Admin sizni guruhga mentor qilib biriktirgach, u shu yerda ko'rinadi."
            />
          ) : (
            <MentorGroupsTable groups={groups} />
          )
        }
      </QueryView>
    </Stack>
  );
}
