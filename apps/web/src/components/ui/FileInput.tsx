'use client';

import { useId, useState } from 'react';

import { cn } from '@/lib/cn';

import { peerFocusRing } from './classes';

import type { InputHTMLAttributes, Ref } from 'react';

export interface FileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'multiple' | 'value' | 'onChange'
> {
  /** Tanlangan fayl (yoki bekor qilinsa `null`). */
  onFileChange?: (file: File | null) => void;
  buttonLabel?: string;
  emptyLabel?: string;
  /** Xato holati: qizil chegara va `aria-invalid`. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

function joinIds(...ids: (string | undefined)[]): string {
  return ids.filter((id) => id !== undefined && id !== '').join(' ');
}

interface FileButtonProps {
  htmlFor: string;
  invalid: boolean;
  children: string;
}

/** Ko'rinadigan "tugma": input'ning `aria-hidden` labeli (nomni FormField labeli beradi). */
function FileButton({ htmlFor, invalid, children }: FileButtonProps) {
  return (
    <label
      htmlFor={htmlFor}
      aria-hidden="true"
      className={cn(
        'inline-flex h-10 cursor-pointer items-center rounded-md border bg-bg px-4 text-sm font-medium text-text hover:bg-surface-muted',
        peerFocusRing,
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        invalid ? 'border-danger' : 'border-border',
      )}
    >
      {children}
    </label>
  );
}

/**
 * Bitta fayl tanlash (masalan CSV). Tabiiy `<input type="file">` ko'rinmas, lekin fokuslanadi va
 * FormField'dan `id`/`aria-describedby` oladi; ko'rinadigan "tugma" — `aria-hidden` label.
 * Tanlangan fayl nomi `aria-describedby` orqali maydonga bog'langan.
 */
export function FileInput({
  id,
  onFileChange,
  buttonLabel = 'Fayl tanlash',
  emptyLabel = 'Fayl tanlanmagan',
  invalid = false,
  disabled,
  className,
  'aria-describedby': describedBy,
  ...rest
}: FileInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const fileNameId = `${inputId}-file-name`;
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <input
        id={inputId}
        type="file"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={joinIds(describedBy, fileNameId)}
        className="peer sr-only"
        onChange={(event) => {
          const file = event.target.files?.item(0) ?? null;
          setFileName(file?.name ?? null);
          onFileChange?.(file);
        }}
        {...rest}
      />
      <FileButton htmlFor={inputId} invalid={invalid}>
        {buttonLabel}
      </FileButton>
      <span
        id={fileNameId}
        className={cn('text-sm break-all', fileName === null ? 'text-text-muted' : 'text-text')}
      >
        {fileName ?? emptyLabel}
      </span>
    </div>
  );
}
