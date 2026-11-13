import { FormField, Input, Textarea } from '@/components/ui';

import type { HTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface OptionalTextFieldProps {
  label: string;
  /** `form.register('field')` natijasi. */
  registration: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  /** Ko'p qatorli (`Textarea`). */
  multiline?: boolean;
  rows?: number;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
}

/** Ixtiyoriy matn maydoni (`FormField` + `Input`/`Textarea`); majburiylari — `FormTextField`. */
export function OptionalTextField({
  label,
  registration,
  error,
  hint,
  multiline = false,
  rows,
  ...inputProps
}: OptionalTextFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint}>
      {({ invalid, required: _required, ...control }) =>
        multiline ? (
          <Textarea {...control} rows={rows} invalid={invalid} {...registration} />
        ) : (
          <Input {...control} {...inputProps} invalid={invalid} {...registration} />
        )
      }
    </FormField>
  );
}
