'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { adminUsersKeys } from '../api/admin-users.query-keys';

import type { ManagedUserKind } from '../types/admin-users.types';

/**
 * Javobida bir martalik maxfiy qiymat (vaqtinchalik parol) bo'lgan mutatsiya: yaratish, parolni
 * tiklash, CSV import. Natija FAQAT komponent holatida turadi — react-query keshiga yozilmaydi:
 * mutatsiya `gcTime: 0` bilan va muvaffaqiyatdan so'ng darhol `reset()` qilinadi. Ro'yxat
 * keshi faqat bekor qilinadi (invalidate), javob unga qo'yilmaydi.
 */
export function useSecretMutation<TVariables, TResult>(
  kind: ManagedUserKind,
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<TResult | null>(null);
  const mutation = useMutation({ mutationFn, gcTime: 0 });
  const { mutateAsync, reset } = mutation;

  /** Muvaffaqiyatsiz bo'lsa xato tashlanadi (va `error` da qoladi). */
  const run = async (variables: TVariables): Promise<TResult> => {
    const data = await mutateAsync(variables);
    reset();
    setResult(data);
    void queryClient.invalidateQueries({ queryKey: adminUsersKeys.kind(kind) });
    return data;
  };

  return {
    run,
    result,
    /** Natijani (maxfiy qiymatni) xotiradan o'chiradi va xatoni tozalaydi. */
    clear: () => {
      setResult(null);
      reset();
    },
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
