'use client';

import { useMutation } from '@tanstack/react-query';

import type { AuthUser, ChangePasswordRequest } from '@lms/shared';

import { useAuthStore } from '@/stores/auth.store';

import { authApi } from '../api/auth.api';
import { loadSessionUser } from '../api/session';

/**
 * `POST /auth/change-password` (docs/02 §4.2): yangi access token (`mcp=false`) store'ga yoziladi,
 * so'ng `GET /auth/me` bilan identifikatsiya yangilanadi. Natija — yangilangan foydalanuvchi.
 */
async function changePassword(body: ChangePasswordRequest): Promise<AuthUser | null> {
  const { accessToken } = await authApi.changePassword(body);
  useAuthStore.getState().setAccessToken(accessToken);
  return loadSessionUser();
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
