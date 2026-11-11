'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { changePasswordFormSchema } from '@lms/shared';
import type { ChangePasswordFormValues } from '@lms/shared';

import { applyApiError } from '@/lib/forms';

import { ROLE_HOME_PATH } from '../lib/auth-paths';

import { useChangePassword } from './useChangePassword';

const EMPTY_VALUES: ChangePasswordFormValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const SERVER_FIELDS = { oldPassword: 'oldPassword', newPassword: 'newPassword' } as const;

/** Parolni almashtirish formasi holati: validatsiya, yuborish, server xatolari, yo'naltirish. */
export function useChangePasswordForm() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const submit = form.handleSubmit(async ({ oldPassword, newPassword }) => {
    try {
      const user = await changePassword.mutateAsync({ oldPassword, newPassword });
      if (user !== null) {
        router.replace(ROLE_HOME_PATH[user.role]);
      }
    } catch (error) {
      applyApiError(error, form.setError, SERVER_FIELDS);
    }
  });

  return { form, submit, isPending: changePassword.isPending };
}
