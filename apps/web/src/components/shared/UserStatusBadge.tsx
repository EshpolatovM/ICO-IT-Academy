import { UserStatus } from '@lms/shared';

import { Badge } from '@/components/ui';

/** Holat nomlari (jadval, filtr, tafsilot). */
export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Faol',
  [UserStatus.INACTIVE]: 'Nofaol',
};

/** Foydalanuvchi holati belgisi. */
export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={status === UserStatus.ACTIVE ? 'success' : 'neutral'}>
      {USER_STATUS_LABEL[status]}
    </Badge>
  );
}
