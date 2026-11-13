'use client';

import { useApiForm } from '@/lib/forms';
import type { UseApiFormOptions } from '@/lib/forms';

import type { FieldValues } from 'react-hook-form';

export interface UseContentFormOptions<
  TInput extends FieldValues,
  TOutput,
> extends UseApiFormOptions<TInput, TOutput> {
  submitLabel: string;
  onCancel: () => void;
}

/** Kontent forma oynasi: `useApiForm` + `ContentFormShell` uchun tayyor props (`shell`). */
export function useContentForm<TInput extends FieldValues, TOutput>({
  submitLabel,
  onCancel,
  ...options
}: UseContentFormOptions<TInput, TOutput>) {
  const { form, submit } = useApiForm(options);
  const { formState } = form;
  return {
    form,
    errors: formState.errors,
    shell: { submit, formState, submitLabel, onCancel },
  };
}
