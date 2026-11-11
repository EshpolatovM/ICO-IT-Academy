'use client';

import { FilterField } from '@/components/shared';
import { GroupCombobox, useGroupFilterOption } from '@/features/admin-groups';

import { useListUrlState } from '../hooks/useListUrlState';

/** Studentlar ro'yxatidagi guruh filtri (`groupId` URL'da; variantlar — faol guruhlar). */
export function StudentGroupFilter() {
  const { state, setGroupId } = useListUrlState();
  const selected = useGroupFilterOption(state.groupId);
  return (
    <FilterField label="Guruh" width="wide">
      {(control) => (
        <GroupCombobox
          control={control}
          value={selected.option}
          placeholder="Hammasi"
          onChange={(option) => {
            if (option !== null) {
              selected.remember(option);
            }
            setGroupId(option?.value);
          }}
        />
      )}
    </FilterField>
  );
}
