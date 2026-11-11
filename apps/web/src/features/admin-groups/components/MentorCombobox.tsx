'use client';

import { Combobox } from '@/components/ui';
import type { ComboboxOption, FormFieldControlProps } from '@/components/ui';

import { useMentorOptions } from '../hooks/useLookupOptions';

export interface MentorComboboxProps {
  control: FormFieldControlProps;
  value: ComboboxOption | null;
  onChange: (value: ComboboxOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

/** Faol mentorni qidirib tanlash (bitta). `FormField` render-prop'i ichida ishlatiladi. */
export function MentorCombobox({
  control: { required: _required, ...control },
  value,
  onChange,
  placeholder = 'Mentor ismi yoki telefoni',
  disabled,
}: MentorComboboxProps) {
  const mentors = useMentorOptions();
  return (
    <Combobox
      {...control}
      value={value}
      onChange={onChange}
      options={mentors.options}
      loading={mentors.loading}
      onSearchChange={mentors.onSearch}
      listLabel="Mentorlar"
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
