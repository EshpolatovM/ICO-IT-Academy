import { useId } from 'react';

import { cn } from '@/lib/cn';

import { joinIds } from './joinIds';
import { Label } from './Label';

import type { ReactNode } from 'react';

/** FormField ichidagi maydonga uzatiladigan bog'lanish atributlari. */
export interface FormFieldControlProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  invalid: boolean;
  required: boolean;
}

export interface FormFieldProps {
  label: string;
  /** Berilmasa avtomatik (`useId`) yaratiladi. */
  id?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render-prop: maydon `id`, `aria-describedby`, `aria-invalid` bilan chiziladi. */
  children: (control: FormFieldControlProps) => ReactNode;
}

/** Label + maydon + yordam matni + xato matni; hammasi `id`/`aria-describedby` bilan bog'langan. */
export function FormField({
  label,
  id,
  hint,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const hasError = error !== undefined && error !== '';
  const hasHint = hint !== undefined && hint !== '';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Label htmlFor={controlId} required={required}>
        {label}
      </Label>
      {children({
        id: controlId,
        'aria-describedby': joinIds(hasHint && hintId, hasError && errorId),
        'aria-invalid': hasError || undefined,
        invalid: hasError,
        required,
      })}
      {hasHint ? (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
