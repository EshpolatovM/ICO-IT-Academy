'use client';

import { PASSWORD_POLICY_MESSAGE } from '@lms/shared';

import { Button, Stack } from '@/components/ui';

import { useChangePasswordForm } from '../hooks/useChangePasswordForm';

import { FormRootError } from './FormRootError';
import { FormTextField } from './FormTextField';

/** Parolni almashtirish (docs/02 §4.2): eski parol + yangi parol x2; muvaffaqiyatda bosh sahifaga. */
export function ChangePasswordForm() {
  const { form, submit, isPending } = useChangePasswordForm();
  const { errors } = form.formState;

  return (
    <form noValidate onSubmit={(event) => void submit(event)} data-testid="change-password-form">
      <Stack gap="4">
        <FormRootError message={errors.root?.server?.message} />
        <FormTextField
          label="Joriy parol"
          type="password"
          registration={form.register('oldPassword')}
          error={errors.oldPassword?.message}
          autoComplete="current-password"
          autoFocus
        />
        <FormTextField
          label="Yangi parol"
          type="password"
          registration={form.register('newPassword')}
          error={errors.newPassword?.message}
          hint={PASSWORD_POLICY_MESSAGE}
          autoComplete="new-password"
        />
        <FormTextField
          label="Yangi parolni takrorlang"
          type="password"
          registration={form.register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth loading={isPending}>
          Parolni saqlash
        </Button>
      </Stack>
    </form>
  );
}
