import type { FieldValues, Path } from 'react-hook-form';

/** Forma maydoni tavsifi (`UserForm` uni `FormTextField` sifatida chizadi). */
export interface UserFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: 'text' | 'tel';
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}

interface PersonNameValues {
  firstName: string;
  lastName: string;
}

/** Tipsiz (literal) — ism-familiyali har qanday formaga mos keladi. */
const FIRST_NAME_FIELD = { name: 'firstName', label: 'Ism', autoComplete: 'off' } as const;
const LAST_NAME_FIELD = { name: 'lastName', label: 'Familiya', autoComplete: 'off' } as const;

export const STUDENT_FIELDS: readonly UserFieldConfig<PersonNameValues>[] = [
  FIRST_NAME_FIELD,
  LAST_NAME_FIELD,
];

export const STAFF_FIELDS: readonly UserFieldConfig<PersonNameValues & { phone: string }>[] = [
  {
    name: 'phone',
    label: 'Telefon raqam',
    type: 'tel',
    placeholder: '+998901234567',
    autoComplete: 'off',
  },
  FIRST_NAME_FIELD,
  LAST_NAME_FIELD,
];
