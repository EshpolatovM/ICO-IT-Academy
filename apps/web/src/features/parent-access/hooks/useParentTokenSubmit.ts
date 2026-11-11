'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useParentSessionStore } from '@/stores/parent-session.store';

import { parentAccessApi } from '../api/parent-access.api';
import { parentQueryKeys } from '../api/parent-query-keys';
import { toParentMe } from '../api/parent-session';

/**
 * Kodni kiritish (kirish yoki "Farzand qo'shish"): `{tokens:[kod], merge:true}` — yangi farzand
 * mavjud sessiyaga qo'shiladi (docs/10 §3). Muvaffaqiyatda farzandlar ro'yxati yangilanadi.
 */
export function useParentTokenSubmit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => parentAccessApi.exchange([token]),
    onSuccess: (result) => {
      queryClient.setQueryData(parentQueryKeys.me, toParentMe(result));
      const store = useParentSessionStore.getState();
      store.setLinkError(null);
      store.setStatus('active');
    },
  });
}
