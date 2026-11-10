'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PARENT_TOKEN_LENGTH, parentTokenSchema } from '@lms/shared';

import { Button, Stack } from '@/components/ui';
import { FormRootError, FormTextField } from '@/features/auth';
import { applyApiError } from '@/lib/forms';

import { useParentTokenSubmit } from '../hooks/useParentTokenSubmit';

import type { ParentTokenFormValues } from '../types/parent-access.types';

const parentTokenFormSchema = z.object({ token: parentTokenSchema });

const EMPTY_VALUES: ParentTokenFormValues = { token: '' };

export interface ParentTokenFormProps {
  submitLabel: string;
  autoFocus?: boolean;
}

/** Ota-ona kodi (token) kiritish: kirish yoki "Farzand qo'shish" (`merge: true`). */
export function ParentTokenForm({ submitLabel, autoFocus = false }: ParentTokenFormProps) {
  const submitToken = useParentTokenSubmit();
  const form = useForm<ParentTokenFormValues>({
    resolver: zodResolver(parentTokenFormSchema),
    defaultValues: EMPTY_VALUES,
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit(async ({ token }) => {
    try {
      await submitToken.mutateAsync(token);
      form.reset(EMPTY_VALUES);
    } catch (error) {
      applyApiError(error, form.setError, { tokens: 'token', 'tokens.0': 'token' });
    }
  });

  return (
    <form noValidate onSubmit={(event) => void submit(event)} data-testid="parent-token-form">
      <Stack gap="4">
        <FormRootError message={errors.root?.server?.message} />
        <FormTextField
          label="Kirish kodi"
          registration={form.register('token')}
          error={errors.token?.message}
          hint={`Mentor bergan havoladagi ${String(PARENT_TOKEN_LENGTH)} belgili kod.`}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <Button type="submit" fullWidth loading={submitToken.isPending}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
