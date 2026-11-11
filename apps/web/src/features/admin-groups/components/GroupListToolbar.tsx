'use client';

import { GroupStatus, groupStatusSchema } from '@lms/shared';

import { FormField, SearchInput, Select, Stack } from '@/components/ui';

import { useListSearch } from '../hooks/useListSearch';
import { useMentorFilterOption } from '../hooks/useLookupOptions';

import { GROUP_STATUS_LABEL } from './GroupStatusBadge';
import { MentorCombobox } from './MentorCombobox';
import { PathSelect } from './PathSelect';

import type { GroupListPatch, GroupListState } from '../types/admin-groups.types';

const STATUS_OPTIONS = Object.values(GroupStatus).map((status) => ({
  value: status,
  label: GROUP_STATUS_LABEL[status],
}));

export interface GroupListToolbarProps {
  state: GroupListState;
  onChange: (patch: GroupListPatch) => void;
}

function MentorFilter({ state, onChange }: GroupListToolbarProps) {
  const selected = useMentorFilterOption(state.mentorId);
  return (
    <FormField label="Mentor" className="w-64">
      {(control) => (
        <MentorCombobox
          control={control}
          value={selected.option}
          placeholder="Hammasi"
          onChange={(option) => {
            if (option !== null) {
              selected.remember(option);
            }
            onChange({ mentorId: option?.value });
          }}
        />
      )}
    </FormField>
  );
}

/** Guruhlar filtrlari: nom bo'yicha qidiruv, holat, yo'l, mentor — hammasi URL'da. */
export function GroupListToolbar({ state, onChange }: GroupListToolbarProps) {
  const search = useListSearch(state.q, (q) => {
    onChange({ q });
  });
  return (
    <Stack direction="horizontal" gap="3" align="end" wrap>
      <FormField label="Qidiruv" className="min-w-64 flex-1">
        {({ invalid: _invalid, required: _required, ...control }) => (
          <SearchInput
            {...control}
            value={search.text}
            onValueChange={search.setText}
            placeholder="Guruh nomi"
          />
        )}
      </FormField>
      <FormField label="Holat" className="w-48">
        {({ invalid: _invalid, required: _required, ...control }) => (
          <Select
            {...control}
            options={STATUS_OPTIONS}
            placeholder="Hammasi"
            value={state.status ?? ''}
            onChange={(event) => {
              const parsed = groupStatusSchema.safeParse(event.target.value);
              onChange({ status: parsed.success ? parsed.data : undefined });
            }}
          />
        )}
      </FormField>
      <FormField label="Yo'l" className="w-64">
        {(control) => (
          <PathSelect
            control={{ ...control, required: false }}
            placeholder="Hammasi"
            value={state.pathId ?? ''}
            onChange={(event) => {
              onChange({ pathId: event.target.value === '' ? undefined : event.target.value });
            }}
          />
        )}
      </FormField>
      <MentorFilter state={state} onChange={onChange} />
    </Stack>
  );
}
