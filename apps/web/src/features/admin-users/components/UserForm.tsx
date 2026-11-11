'use client';

import { Button, Stack } from '@/components/ui';
import { FormRootError, FormTextField } from '@/features/auth';

import { useUserForm } from '../hooks/useUserForm';

import type { UseUserFormOptions } from '../hooks/useUserForm';
import type { UserFieldConfig } from '../lib/user-fields';
import type { FieldValues } from 'react-hook-form';

export interface UserFormProps<TInput extends FieldValues, TOutput> extends UseUserFormOptions<
  TInput,
  TOutput
> {
  fields: readonly UserFieldConfig<TInput>[];
  submitLabel: string;
  /** Berilsa — "Bekor qilish" tugmasi. */
  onCancel?: () => void;
}

/** Foydalanuvchi formasi (yaratish/tahrirlash): maydonlar, umumiy xato, tugmalar. */
export function UserForm<TInput extends FieldValues, TOutput>({
  fields,
  submitLabel,
  onCancel,
  ...options
}: UserFormProps<TInput, TOutput>) {
  const { form, submit } = useUserForm(options);
  const { isSubmitting, errors } = form.formState;

  return (
    <form noValidate onSubmit={(event) => void submit(event)}>
      <Stack gap="4">
        {fields.map((field) => (
          <FormTextField
            key={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            hint={field.hint}
            registration={form.register(field.name)}
            error={form.getFieldState(field.name, form.formState).error?.message}
          />
        ))}
        <FormRootError message={errors.root?.server?.message} />
        <Stack direction="horizontal" gap="2" justify="end">
          {onCancel !== undefined ? (
            <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              Bekor qilish
            </Button>
          ) : null}
          <Button type="submit" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
