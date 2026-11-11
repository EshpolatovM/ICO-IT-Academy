'use client';

import { Select } from '@/components/ui';

import { FilterField } from './FilterField';

export interface StatusFilterSelectProps<T extends string> {
  /** Holatlar va ularning nomlari. */
  labels: Record<T, string>;
  value: T | undefined;
  /** Tanlangan holat; "Hammasi" yoki noma'lum qiymat — `undefined`. */
  onChange: (status: T | undefined) => void;
}

/** Ro'yxat filtri: holat bo'yicha ("Hammasi" — filtrsiz). */
export function StatusFilterSelect<T extends string>({
  labels,
  value,
  onChange,
}: StatusFilterSelectProps<T>) {
  const statuses = Object.keys(labels) as T[];
  const options = statuses.map((status) => ({ value: status, label: labels[status] }));
  return (
    <FilterField label="Holat" width="narrow">
      {({ invalid: _invalid, required: _required, ...control }) => (
        <Select
          {...control}
          options={options}
          placeholder="Hammasi"
          value={value ?? ''}
          onChange={(event) => {
            onChange(statuses.find((status) => status === event.target.value));
          }}
        />
      )}
    </FilterField>
  );
}
