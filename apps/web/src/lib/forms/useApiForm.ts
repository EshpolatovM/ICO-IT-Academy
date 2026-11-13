'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { applyFormError } from './apply-form-error';

import type { ServerFieldMap } from './apply-api-error';
import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

export interface UseApiFormOptions<TInput extends FieldValues, TOutput> {
  schema: z.ZodType<TOutput, TInput>;
  defaultValues: DefaultValues<TInput>;
  serverFields: ServerFieldMap<TInput>;
  /** Validatsiyadan o'tgan qiymatlar bilan; xato tashlasa — u formaga o'tkaziladi. */
  onValid: (values: TOutput) => Promise<unknown>;
}

/**
 * API formasi: zod validatsiya + server xatolari (`applyFormError`: 400 `details[].field`,
 * 409 `details.field`) tegishli maydonga, qolgani — `errors.root.server`.
 */
export function useApiForm<TInput extends FieldValues, TOutput>({
  schema,
  defaultValues,
  serverFields,
  onValid,
}: UseApiFormOptions<TInput, TOutput>) {
  const form = useForm<TInput, unknown, TOutput>({ resolver: zodResolver(schema), defaultValues });
  const submit = form.handleSubmit(async (values) => {
    try {
      await onValid(values);
    } catch (error) {
      applyFormError(error, form.setError, serverFields);
    }
  });
  return { form, submit };
}
