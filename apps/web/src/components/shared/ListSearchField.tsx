'use client';

import { FormField, SearchInput } from '@/components/ui';
import { useSearchField } from '@/lib/hooks';

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
    <FormField label="Qidiruv" className="min-w-64 flex-1">
      {({ invalid: _invalid, required: _required, ...control }) => (
        <SearchInput
          {...control}
          value={search.value}
          onValueChange={search.setValue}
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
}
