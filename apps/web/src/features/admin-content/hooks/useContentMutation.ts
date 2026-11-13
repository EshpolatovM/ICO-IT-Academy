'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminContentKeys } from '../api/admin-content.query-keys';

/**
 * Kontent mutatsiyasi: muvaffaqiyatdan keyin butun admin kontent keshi (ro'yxat, daraxtlar,
 * darslar) yangilanadi — sanoqlar (`sectionsCount`) va tartib bir joyda to'g'ri bo'lsin.
 */
export function useContentMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
  });
}
