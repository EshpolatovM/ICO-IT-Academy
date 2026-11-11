'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { QueryKey } from '@tanstack/react-query';

/**
 * Javobida bir martalik maxfiy qiymat (vaqtinchalik parol, ota-ona tokeni/havolasi) bo'lgan
 * mutatsiya. Natija FAQAT komponent holatida turadi — react-query keshiga yozilmaydi:
 * mutatsiya `gcTime: 0` bilan va muvaffaqiyatdan so'ng darhol `reset()` qilinadi.
 * `invalidateKey` berilsa, shu kalit ostidagi query'lar faqat bekor qilinadi (invalidate),
 * javob ularga qo'yilmaydi.
 */
export function useSecretMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  invalidateKey?: QueryKey,
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
    if (invalidateKey !== undefined) {
      void queryClient.invalidateQueries({ queryKey: invalidateKey });
    }
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
