'use client';

import { SearchInput } from '@/components/ui';
import { useSearchField } from '@/lib/hooks';

import { FilterField } from './FilterField';

export interface ListSearchFieldProps {
  /** URL'dagi joriy qidiruv. */
  q: string;
  onSearch: (q: string) => void;
  placeholder: string;
}

/** Ro'yxat qidiruvi maydoni: kiritish darhol ko'rinadi, `onSearch` debounce bilan chaqiriladi. */
export function ListSearchField({ q, onSearch, placeholder }: ListSearchFieldProps) {
  const search = useSearchField(q, onSearch);
  return (
    <FilterField label="Qidiruv" width="fill">
      {({ invalid: _invalid, required: _required, ...control }) => (
        <SearchInput
          {...control}
          value={search.value}
          onValueChange={search.setValue}
          placeholder={placeholder}
        />
      )}
    </FilterField>
  );
}
