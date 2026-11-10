import { FormField, Input, PasswordInput } from '@/components/ui';
import type { InputType } from '@/components/ui';

import type { HTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface FormTextFieldProps {
  label: string;
  /** `form.register('field')` natijasi. */
  registration: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  /** `password` — `PasswordInput` (ko'rsatish/yashirish tugmasi bilan). */
  type?: Extract<InputType, 'text' | 'tel' | 'password'>;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  autoFocus?: boolean;
}

/**
 * React Hook Form maydoni: `components/ui` dagi `FormField` + `Input`/`PasswordInput` kompozitsiyasi
 * (label, xato matni va `aria-*` bog'lanishlari bilan). Validatsiya — zod sxemasi orqali.
 */
export function FormTextField({
  label,
  registration,
  error,
  hint,
  type = 'text',
  ...inputProps
}: FormTextFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required>
      {({ invalid, required: _required, ...control }) =>
        type === 'password' ? (
          <PasswordInput {...control} {...inputProps} invalid={invalid} {...registration} />
        ) : (
          <Input {...control} {...inputProps} type={type} invalid={invalid} {...registration} />
        )
      }
    </FormField>
  );
}
