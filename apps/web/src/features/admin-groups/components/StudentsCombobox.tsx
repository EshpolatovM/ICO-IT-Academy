'use client';

import { Combobox } from '@/components/ui';
import type { ComboboxOption, FormFieldControlProps } from '@/components/ui';

import { useStudentOptions } from '../hooks/useLookupOptions';

export interface StudentsComboboxProps {
  /** Joriy guruh — uning a'zolari variantlarda ko'rinmaydi. */
  groupId: string;
  control: FormFieldControlProps;
  value: readonly ComboboxOption[];
  onChange: (value: ComboboxOption[]) => void;
  disabled?: boolean;
}

/** Faol studentlarni qidirib tanlash (bir nechta; tavsifda joriy guruhi). `FormField` render-prop'i ichida ishlatiladi. */
export function StudentsCombobox({
  groupId,
  control: { required: _required, ...control },
  value,
  onChange,
  disabled,
}: StudentsComboboxProps) {
  const students = useStudentOptions(groupId);
  return (
    <Combobox
      {...control}
      multiple
      value={value}
      onChange={onChange}
      options={students.options}
      loading={students.loading}
      onSearchChange={students.onSearch}
      listLabel="Studentlar"
      placeholder="Student ID (ST-10245) yoki ism"
      disabled={disabled}
    />
  );
}
