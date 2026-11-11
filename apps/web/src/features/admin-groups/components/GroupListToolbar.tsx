'use client';

import { ListSearchField, StatusFilterSelect } from '@/components/shared';
import { FormField, Stack } from '@/components/ui';

import { useMentorFilterOption } from '../hooks/useLookupOptions';

import { GROUP_STATUS_LABEL } from './GroupStatusBadge';
import { MentorCombobox } from './MentorCombobox';
import { PathSelect } from './PathSelect';

import type { GroupListPatch, GroupListState } from '../types/admin-groups.types';

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
  return (
    <Stack direction="horizontal" gap="3" align="end" wrap>
      <ListSearchField
        q={state.q}
        onSearch={(q) => {
          onChange({ q });
        }}
        placeholder="Guruh nomi"
      />
      <StatusFilterSelect
        labels={GROUP_STATUS_LABEL}
        value={state.status}
        onChange={(status) => {
          onChange({ status });
        }}
      />
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
