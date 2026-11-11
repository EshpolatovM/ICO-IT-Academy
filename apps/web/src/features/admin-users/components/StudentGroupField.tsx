'use client';

import { useState } from 'react';

import { FormField } from '@/components/ui';
import type { ComboboxOption } from '@/components/ui';
import { GroupCombobox } from '@/features/admin-groups';

import type { CreateStudentFormInput, CreateStudentFormValues } from '../lib/user-forms';
import type { UseFormReturn } from 'react-hook-form';

export interface StudentGroupFieldProps {
  form: UseFormReturn<CreateStudentFormInput, unknown, CreateStudentFormValues>;
}

/** "Yangi student" formasidagi ixtiyoriy guruh (faqat faol guruhlar) → `groupId`. */
export function StudentGroupField({ form }: StudentGroupFieldProps) {
  const [group, setGroup] = useState<ComboboxOption | null>(null);
  return (
    <FormField label="Guruh" hint="Ixtiyoriy" error={form.formState.errors.groupId?.message}>
      {(control) => (
        <GroupCombobox
          control={control}
          value={group}
          onChange={(option) => {
            setGroup(option);
            form.setValue('groupId', option?.value ?? null);
          }}
        />
      )}
    </FormField>
  );
}
