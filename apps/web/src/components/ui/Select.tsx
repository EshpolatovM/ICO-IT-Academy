import { cn } from '@/lib/cn';

import { fieldBase, fieldInvalid, focusRing } from './classes';

import type { Ref, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple'> {
  options: readonly SelectOption[];
  /**
   * Bo'sh qiymatli (`value=""`) birinchi variant, masalan "Guruhni tanlang" yoki filtrda "Hammasi".
   * `required` maydonda brauzer bo'sh qiymatni qabul qilmaydi.
   */
  placeholder?: string;
  /** Xato holati: qizil chegara va `aria-invalid`. */
  invalid?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

/** Tabiiy `<select>` (klaviatura va ekran o'quvchilar uchun brauzerning o'zi). FormField bilan mos. */
export function Select({ options, placeholder, invalid = false, className, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, focusRing, invalid && fieldInvalid, className)}
      {...rest}
    >
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
