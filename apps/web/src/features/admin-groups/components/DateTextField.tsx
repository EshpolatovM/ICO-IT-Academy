import { FormField, Input } from '@/components/ui';

import type { UseFormRegisterReturn } from 'react-hook-form';

export interface DateTextFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

/**
 * Ixtiyoriy sana (`YYYY-MM-DD`) matn maydoni sifatida — `components/ui` da sana maydoni hali yo'q.
 * Bo'sh qoldirilsa — sanasiz (`null`).
 */
export function DateTextField({ label, registration, error }: DateTextFieldProps) {
  return (
    <FormField label={label} error={error} hint="Format: YYYY-MM-DD (ixtiyoriy)">
      {({ required: _required, ...control }) => (
        <Input {...control} {...registration} inputMode="numeric" placeholder="2026-12-01" />
      )}
    </FormField>
  );
}
