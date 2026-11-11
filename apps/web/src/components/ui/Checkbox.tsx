'use client';

import { useCallback, useId } from 'react';

import { cn } from '@/lib/cn';

import { assignRef } from './assignRef';
import { focusRing } from './classes';
import { isPresentNode } from './isPresentNode';
import { joinIds } from './joinIds';

import type { InputHTMLAttributes, ReactNode, Ref } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Katakcha yonidagi yorliq. FormField ichida ishlatilsa berilmaydi (yorliqni FormField beradi). */
  label?: ReactNode;
  /** Yorliq ostidagi izoh (`aria-describedby` orqali bog'lanadi). */
  description?: ReactNode;
  /** "Qisman tanlangan" holat (masalan jadvalda "hammasini tanlash"): `checked` dan ustun ko'rinadi. */
  indeterminate?: boolean;
  /** Xato holati: qizil chegara va `aria-invalid`. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

function boxClassName(invalid: boolean, className: string | undefined): string {
  return cn(
    'size-4 shrink-0 cursor-pointer rounded-sm accent-primary disabled:cursor-not-allowed',
    focusRing,
    invalid && 'outline-1 outline-danger',
    className,
  );
}

/** `indeterminate` faqat DOM xususiyati: callback ref orqali yoziladi va tashqi ref bilan birlashadi. */
function useIndeterminateRef(ref: Ref<HTMLInputElement> | undefined, indeterminate: boolean) {
  return useCallback(
    (node: HTMLInputElement | null) => {
      if (node !== null) {
        node.indeterminate = indeterminate;
      }
      assignRef(ref, node);
    },
    [indeterminate, ref],
  );
}

interface CheckboxTextProps {
  htmlFor: string;
  label: ReactNode;
  description: ReactNode;
  /** Izoh faqat id berilganda (ya'ni izoh mavjud bo'lsa) chiziladi. */
  descriptionId: string | undefined;
  disabled: boolean;
}

function CheckboxText({ htmlFor, label, description, descriptionId, disabled }: CheckboxTextProps) {
  return (
    <span className="flex flex-col gap-0.5">
      <label
        htmlFor={htmlFor}
        className={cn(
          'cursor-pointer text-sm text-text',
          disabled && 'cursor-not-allowed text-text-disabled',
        )}
      >
        {label}
      </label>
      {descriptionId !== undefined ? (
        <span id={descriptionId} className="text-xs text-text-muted">
          {description}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Tabiiy `<input type="checkbox">` (klaviatura — Space, ekran o'quvchilar — brauzerning o'zi).
 * `indeterminate` DOM xususiyati ref orqali o'rnatiladi (HTML atributi yo'q).
 */
export function Checkbox({
  label,
  description,
  indeterminate = false,
  invalid = false,
  id,
  className,
  ref,
  'aria-describedby': describedBy,
  ...rest
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasLabel = label !== undefined;
  const descriptionId =
    hasLabel && isPresentNode(description) ? `${inputId}-description` : undefined;

  const setRef = useIndeterminateRef(ref, indeterminate);

  const input = (
    <input
      ref={setRef}
      id={inputId}
      type="checkbox"
      aria-invalid={invalid || undefined}
      aria-describedby={joinIds(describedBy, descriptionId)}
      className={boxClassName(invalid, hasLabel ? undefined : className)}
      {...rest}
    />
  );

  if (!hasLabel) {
    return input;
  }

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <span className="flex h-5 items-center">{input}</span>
      <CheckboxText
        htmlFor={inputId}
        label={label}
        description={description}
        descriptionId={descriptionId}
        disabled={rest.disabled === true}
      />
    </div>
  );
}
