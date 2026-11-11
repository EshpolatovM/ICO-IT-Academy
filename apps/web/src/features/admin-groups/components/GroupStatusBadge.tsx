import { GroupStatus } from '@lms/shared';

import { Badge } from '@/components/ui';

/** Guruh holati nomlari (jadval, filtr, tafsilot). */
export const GROUP_STATUS_LABEL: Record<GroupStatus, string> = {
  [GroupStatus.ACTIVE]: 'Faol',
  [GroupStatus.ARCHIVED]: 'Arxivlangan',
};

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  return (
    <Badge variant={status === GroupStatus.ACTIVE ? 'success' : 'neutral'}>
      {GROUP_STATUS_LABEL[status]}
    </Badge>
  );
}
