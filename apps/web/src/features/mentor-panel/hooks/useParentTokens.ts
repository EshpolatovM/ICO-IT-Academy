'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateParentTokenRequest } from '@lms/shared';

import { useSecretMutation } from '@/lib/hooks';

import { mentorPanelKeys } from '../api/mentor-panel.query-keys';
import { parentTokensApi } from '../api/parent-tokens.api';

/** `GET /students/:id/parent-tokens` — faol tokenlar (faqat `prefix`, xom token yo'q). */
export function useParentTokens(studentId: string) {
  return useQuery({
    queryKey: mentorPanelKeys.parentTokens(studentId),
    queryFn: () => parentTokensApi.list(studentId),
    select: (data) => data.items,
  });
}

/** `POST …/parent-tokens`: javob (`token`, `link`) faqat hook holatida — keshsiz. */
export function useCreateParentToken(studentId: string) {
  return useSecretMutation(
    (body: CreateParentTokenRequest) => parentTokensApi.create(studentId, body),
    mentorPanelKeys.student(studentId),
  );
}

/** `DELETE …/parent-tokens/:tokenId` — ro'yxat va profil (tokenlar soni) qayta yuklanadi. */
export function useRevokeParentToken(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: string) => parentTokensApi.revoke(studentId, tokenId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mentorPanelKeys.student(studentId) });
    },
  });
}
