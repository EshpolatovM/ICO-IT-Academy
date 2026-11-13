import { FormField, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';

import type { UseFormRegisterReturn } from 'react-hook-form';

export interface SelectFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  options: readonly SelectOption[];
  error?: string;
  placeholder?: string;
  required?: boolean;
}

/** React Hook Form uchun `FormField` + `Select` (holat, sandiq mavzusi). */
export function SelectField({
  label,
  registration,
  options,
  error,
  placeholder,
  required = false,
}: SelectFieldProps) {
  return (
    <FormField label={label} error={error} required={required}>
      {({ invalid, required: _required, ...control }) => (
        <Select
          {...control}
          options={options}
          placeholder={placeholder}
          invalid={invalid}
          {...registration}
        />
      )}
    </FormField>
  );
}
