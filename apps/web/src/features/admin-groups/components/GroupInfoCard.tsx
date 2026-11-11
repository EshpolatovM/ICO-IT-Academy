import type { AdminGroupDetail } from '@lms/shared';

import { Card, CardContent, CardHeader, CardTitle, DescriptionList } from '@/components/ui';

import { formatDateOnly, formatIsoDate, personName } from '../lib/format';

import { GroupStatusBadge } from './GroupStatusBadge';

/** Guruh ma'lumotlari (faqat ko'rish). */
export function GroupInfoCard({ group }: { group: AdminGroupDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma&apos;lumotlar</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList
          items={[
            { term: "Yo'l", value: group.path.title },
            { term: 'Mentor', value: personName(group.mentor) },
            { term: 'Studentlar soni', value: group.membersCount },
            { term: 'Holat', value: <GroupStatusBadge status={group.status} /> },
            { term: 'Boshlanish sanasi', value: formatDateOnly(group.startsAt) },
            { term: 'Yaratilgan', value: formatIsoDate(group.createdAt) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
