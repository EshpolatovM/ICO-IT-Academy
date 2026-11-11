'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/auth.store';

import { authApi } from '../api/auth.api';

/**
 * "Chiqish": `POST /auth/logout`, so'ng (xato bo'lsa ham) xotiradagi sessiya va server keshi
 * tozalanadi. Login sahifasiga yo'naltirishni route guard bajaradi (oxirgi rol bo'yicha).
 */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      useAuthStore.getState().clear();
      queryClient.clear();
    },
  });
}
