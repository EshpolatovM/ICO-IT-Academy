'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { ServerFieldMap } from '@/lib/forms';

import { applyUserFormError } from '../lib/user-form-error';

import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

export interface UseUserFormOptions<TInput extends FieldValues, TOutput> {
  schema: z.ZodType<TOutput, TInput>;
  defaultValues: DefaultValues<TInput>;
  serverFields: ServerFieldMap<TInput>;
  /** Validatsiyadan o'tgan qiymatlar bilan; xato tashlasa — u formaga o'tkaziladi. */
  onValid: (values: TOutput) => Promise<unknown>;
}

/** Foydalanuvchi formasi: zod (`@lms/shared`) validatsiya + server xatolari maydonlarga. */
export function useUserForm<TInput extends FieldValues, TOutput>({
  schema,
  defaultValues,
  serverFields,
  onValid,
}: UseUserFormOptions<TInput, TOutput>) {
  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await onValid(values);
    } catch (error) {
      applyUserFormError(error, form.setError, serverFields);
    }
  });

  return { form, submit };
}
