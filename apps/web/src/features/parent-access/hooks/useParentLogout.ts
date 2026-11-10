'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useParentSessionStore } from '@/stores/parent-session.store';

import { logoutParent } from '../api/parent-access.api';
import { parentQueryKeys } from '../api/parent-query-keys';

/** Ota-ona "Chiqish": ikkala cookie o'chiriladi, so'ng token kiritish formasi ko'rsatiladi. */
export function useParentLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutParent,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: parentQueryKeys.all });
      useParentSessionStore.getState().setStatus('none');
    },
  });
}
