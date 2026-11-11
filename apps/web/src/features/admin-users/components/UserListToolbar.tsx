'use client';

import type { UserStatus } from '@lms/shared';

import { ListSearchField, StatusFilterSelect, USER_STATUS_LABEL } from '@/components/shared';
import { Stack } from '@/components/ui';

import type { ReactNode } from 'react';

export interface UserListToolbarProps {
  q: string;
  onSearch: (q: string) => void;
  searchPlaceholder: string;
  status: UserStatus | undefined;
  onStatusChange: (status: UserStatus | undefined) => void;
  /** Qo'shimcha filtrlar (masalan studentlarda guruh). */
  extraFilters?: ReactNode;
}

/** Ro'yxat filtrlari: qidiruv (debounce bilan), holat, qo'shimcha filtrlar. */
export function UserListToolbar({
  q,
  onSearch,
  searchPlaceholder,
  status,
  onStatusChange,
  extraFilters,
}: UserListToolbarProps) {
  return (
    <Stack direction="horizontal" gap="3" align="end" wrap>
      <ListSearchField q={q} onSearch={onSearch} placeholder={searchPlaceholder} />
      <StatusFilterSelect labels={USER_STATUS_LABEL} value={status} onChange={onStatusChange} />
      {extraFilters}
    </Stack>
  );
}
