'use client';

import { Combobox } from '@/components/ui';
import type { ComboboxOption, FormFieldControlProps } from '@/components/ui';

/** Qidiruvli tanlov variantlari (`useSearchOptions` natijasi). */
export interface LookupOptions {
  options: ComboboxOption[];
  loading: boolean;
  onSearch: (q: string) => void;
}

/** Bitta variant tanlanadigan lookup Combobox'larining umumiy props'i (mentor, guruh). */
export interface SingleLookupComboboxProps {
  control: FormFieldControlProps;
  value: ComboboxOption | null;
  onChange: (value: ComboboxOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface LookupComboboxProps extends Required<Pick<SingleLookupComboboxProps, 'placeholder'>> {
  props: SingleLookupComboboxProps;
  lookup: LookupOptions;
  listLabel: string;
}

/** Bitta tanlovli qidiruvli Combobox: `FormField` atributlari + server qidiruvi. */
export function LookupCombobox({ props, lookup, listLabel, placeholder }: LookupComboboxProps) {
  const { required: _required, ...control } = props.control;
  return (
    <Combobox
      {...control}
      value={props.value}
      onChange={props.onChange}
      options={lookup.options}
      loading={lookup.loading}
      onSearchChange={lookup.onSearch}
      listLabel={listLabel}
      placeholder={props.placeholder ?? placeholder}
      disabled={props.disabled}
    />
  );
}
