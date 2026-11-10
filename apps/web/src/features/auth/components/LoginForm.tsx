'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, Stack } from '@/components/ui';
import { applyApiError } from '@/lib/forms';

import { useLogin } from '../hooks/useLogin';
import { LOGIN_FORMS } from '../lib/login-forms';

import { FormRootError } from './FormRootError';
import { FormTextField } from './FormTextField';

import type { LoginFormValues, LoginKind } from '../types/login.types';

const EMPTY_VALUES: LoginFormValues = { login: '', password: '' };

/** Login formasi: student (ID + parol) yoki staff (telefon + parol). */
export function LoginForm({ kind }: { kind: LoginKind }) {
  const config = LOGIN_FORMS[kind];
  const login = useLogin(kind);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(config.schema),
    defaultValues: EMPTY_VALUES,
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
    } catch (error) {
      applyApiError(error, form.setError, { [config.serverField]: 'login', password: 'password' });
    }
  });

  return (
    <form noValidate onSubmit={(event) => void submit(event)} data-testid={`${kind}-login-form`}>
      <Stack gap="4">
        <FormRootError message={errors.root?.server?.message} />
        <FormTextField
          label={config.label}
          registration={form.register('login')}
          error={errors.login?.message}
          type={config.type}
          placeholder={config.placeholder}
          autoComplete={config.autoComplete}
          inputMode={config.inputMode}
          autoFocus
        />
        <FormTextField
          label="Parol"
          type="password"
          registration={form.register('password')}
          error={errors.password?.message}
          autoComplete="current-password"
        />
        <Button type="submit" fullWidth loading={login.isPending}>
          Kirish
        </Button>
      </Stack>
    </form>
  );
}
