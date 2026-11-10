'use client';

import { useQuery } from '@tanstack/react-query';

import { ErrorCode } from '@lms/shared';
import type { ParentMeResponse } from '@lms/shared';

import { isApiError } from '@/lib/api';
import { useParentSessionStore } from '@/stores/parent-session.store';

import { parentAccessApi } from '../api/parent-access.api';
import { parentQueryKeys } from '../api/parent-query-keys';

/** Sessiya tugagan bo'lsa (401) — token formasiga qaytariladi. */
async function fetchParentMe(): Promise<ParentMeResponse> {
  try {
    return await parentAccessApi.me();
  } catch (error) {
    if (isApiError(error) && error.code === ErrorCode.UNAUTHORIZED) {
      useParentSessionStore.getState().setStatus('none');
    }
    throw error;
  }
}

/** Ota-onaning farzandlari (`GET /auth/me` → `children`; boshlang'ich qiymat — exchange javobidan). */
export function useParentChildren() {
  const active = useParentSessionStore((state) => state.status === 'active');
  return useQuery({
    queryKey: parentQueryKeys.me,
    queryFn: fetchParentMe,
    enabled: active,
    select: (me) => me.children,
  });
}
