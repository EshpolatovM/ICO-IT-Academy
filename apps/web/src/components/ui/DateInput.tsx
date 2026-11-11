import { cn } from '@/lib/cn';

import { fieldBase, fieldInvalid, focusRing } from './classes';

import type { ChangeEvent, InputHTMLAttributes, Ref } from 'react';

export interface DateInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'
> {
  /** Tanlangan sana `YYYY-MM-DD` formatida; bo'sh qiymat — `''`. */
  value: string;
  /** Yangi qiymat (`YYYY-MM-DD` yoki tozalanganda `''`). */
  onChange: (value: string) => void;
  /** Eng erta ruxsat etilgan sana (`YYYY-MM-DD`). */
  min?: string;
  /** Eng kech ruxsat etilgan sana (`YYYY-MM-DD`). */
  max?: string;
  /** Xato holati: qizil chegara va `aria-invalid`. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/** Sana tanlash maydoni (tabiiy `<input type="date">`), Input bilan bir xil ko'rinishda. */
export function DateInput({
  value,
  onChange,
  invalid = false,
  className,
  ...rest
}: DateInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <input
      type="date"
      value={value}
      onChange={handleChange}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, focusRing, invalid && fieldInvalid, className)}
      {...rest}
    />
  );
}
