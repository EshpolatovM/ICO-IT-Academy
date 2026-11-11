'use client';

import { UserStatus, userStatusSchema } from '@lms/shared';

import { FormField, SearchInput, Select, Stack } from '@/components/ui';

import { useSearchField } from '../hooks/useSearchField';

import { USER_STATUS_LABEL } from './UserStatusBadge';

import type { ReactNode } from 'react';

const STATUS_OPTIONS = Object.values(UserStatus).map((status) => ({
  value: status,
  label: USER_STATUS_LABEL[status],
}));

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
  const search = useSearchField(q, onSearch);

  return (
    <Stack direction="horizontal" gap="3" align="end" wrap>
      <FormField label="Qidiruv" className="min-w-64 flex-1">
        {({ invalid: _invalid, required: _required, ...control }) => (
          <SearchInput
            {...control}
            value={search.value}
            onValueChange={search.setValue}
            placeholder={searchPlaceholder}
          />
        )}
      </FormField>
      <FormField label="Holat" className="w-48">
        {({ invalid: _invalid, required: _required, ...control }) => (
          <Select
            {...control}
            options={STATUS_OPTIONS}
            placeholder="Hammasi"
            value={status ?? ''}
            onChange={(event) => {
              const parsed = userStatusSchema.safeParse(event.target.value);
              onStatusChange(parsed.success ? parsed.data : undefined);
            }}
          />
        )}
      </FormField>
      {extraFilters}
    </Stack>
  );
}
