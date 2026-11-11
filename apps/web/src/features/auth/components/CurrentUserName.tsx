'use client';

import { Text } from '@/components/ui';

import { useCurrentUser } from '../hooks/useCurrentUser';

/** Yuqori paneldagi joriy foydalanuvchi ismi. */
export function CurrentUserName() {
  const user = useCurrentUser();
  if (user === null) {
    return null;
  }
  return (
    <Text as="span" variant="muted" data-testid="current-user-name">
      {user.firstName} {user.lastName}
    </Text>
  );
}
