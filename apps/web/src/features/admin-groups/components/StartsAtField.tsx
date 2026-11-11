import { DateInput, FormField } from '@/components/ui';

import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

const LABEL = 'Boshlanish sanasi';
const HINT = 'Ixtiyoriy';

export interface StartsAtFieldProps<T extends FieldValues> {
  /** `Controller` `render` props'idagi `field` (`startsAt`: `YYYY-MM-DD` | `''` | `null`). */
  field: ControllerRenderProps<T>;
  error?: string;
}

/** Guruhning ixtiyoriy boshlanish sanasi (`DateInput`); tozalansa — `''` (sxemada `null`). */
export function StartsAtField<T extends FieldValues>({ field, error }: StartsAtFieldProps<T>) {
  const value = typeof field.value === 'string' ? field.value : '';
  return (
    <FormField label={LABEL} hint={HINT} error={error}>
      {({ required: _required, ...control }) => (
        <DateInput
          {...control}
          ref={field.ref}
          name={field.name}
          value={value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={field.disabled}
        />
      )}
    </FormField>
  );
}
