'use client';

import { useMutation } from '@tanstack/react-query';

import type { LoginResponse } from '@lms/shared';

import { useAuthStore } from '@/stores/auth.store';

import { authApi } from '../api/auth.api';

import type { LoginFormValues, LoginKind } from '../types/login.types';

function login(kind: LoginKind, { login: value, password }: LoginFormValues) {
  return kind === 'student'
    ? authApi.studentLogin({ studentCode: value, password })
    : authApi.staffLogin({ phone: value, password });
}

function startSession({ accessToken, user }: LoginResponse): void {
  useAuthStore.getState().setSession(accessToken, user);
}

/**
 * Login mutatsiyasi. Muvaffaqiyatda sessiya store'ga yoziladi — so'ng login sahifasining guard'i
 * foydalanuvchini rolga mos bosh sahifaga (yoki `/change-password` ga) o'tkazadi.
 */
export function useLogin(kind: LoginKind) {
  return useMutation({
    mutationFn: (values: LoginFormValues) => login(kind, values),
    onSuccess: startSession,
  });
}
