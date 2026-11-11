'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { applyApiError } from '@/lib/forms';
import type { ServerFieldMap } from '@/lib/forms';

import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

export interface UseGroupFormOptions<TInput extends FieldValues, TOutput> {
  schema: z.ZodType<TOutput, TInput>;
  defaultValues: DefaultValues<TInput>;
  serverFields: ServerFieldMap<TInput>;
  /** Validatsiyadan o'tgan qiymatlar bilan; xato tashlasa — u formaga tushiriladi. */
  onValid: (values: TOutput) => Promise<unknown>;
}

/** Guruh formalari: zod (`@lms/shared`) + 400 `details[].field` xatolari tegishli maydonga. */
export function useGroupForm<TInput extends FieldValues, TOutput>({
  schema,
  defaultValues,
  serverFields,
  onValid,
}: UseGroupFormOptions<TInput, TOutput>) {
  const form = useForm<TInput, unknown, TOutput>({ resolver: zodResolver(schema), defaultValues });
  const submit = form.handleSubmit(async (values) => {
    try {
      await onValid(values);
    } catch (error) {
      applyApiError(error, form.setError, serverFields);
    }
  });
  return { form, submit };
}
