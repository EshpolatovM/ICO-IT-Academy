'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { createParentTokenSchema } from '@lms/shared';
import type { CreateParentTokenRequest } from '@lms/shared';

import { applyApiError } from '@/lib/forms';
import type { ServerFieldMap } from '@/lib/forms';

import { useCreateParentToken } from './useParentTokens';

import type { z } from 'zod';

/** Forma sxemasi: `prefault({})` siz (forma qiymati doim obyekt). */
const formSchema = createParentTokenSchema.unwrap();

type CreateParentTokenInput = NonNullable<CreateParentTokenRequest>;
type CreateParentTokenValues = z.output<typeof formSchema>;

const EMPTY_FORM: CreateParentTokenInput = { label: null };
const SERVER_FIELDS: ServerFieldMap<CreateParentTokenInput> = { label: 'label' };

/** Bo'sh yorliq — `null` (yorliqsiz token; sxema bo'sh satrni qabul qilmaydi). */
export function emptyLabelToNull(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? null : value;
}

/** "Havola yaratish" formasi (`createParentTokenSchema`); natija — `useSecretMutation` holatida. */
export function useCreateParentTokenForm(studentId: string) {
  const mutation = useCreateParentToken(studentId);
  const form = useForm<CreateParentTokenInput, unknown, CreateParentTokenValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_FORM,
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.run(values);
      form.reset(EMPTY_FORM);
    } catch (error) {
      applyApiError(error, form.setError, SERVER_FIELDS);
    }
  });

  return { form, submit, created: mutation.result, clear: mutation.clear };
}
