'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { PARENT_LINK_TOKEN_PARAM } from '@lms/shared';

import { useParentSessionStore } from '@/stores/parent-session.store';
import type { ParentSessionStatus } from '@/stores/parent-session.store';

import { parentQueryKeys } from '../api/parent-query-keys';
import { startParentSession, toParentMe } from '../api/parent-session';

/**
 * Ota-ona sahifasi ochilganda: `?t=` token URL'dan DARHOL olib tashlanadi (`router.replace`,
 * docs/02 §4.5), so'ng sessiya boshlanadi. Bir marta ishlaydi (StrictMode'da ham — `ref`).
 */
export function useParentBootstrap(): ParentSessionStatus {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const status = useParentSessionStore((state) => state.status);
  const startedRef = useRef(false);

  useEffect(() => {
    const linkToken = searchParams.get(PARENT_LINK_TOKEN_PARAM);
    if (linkToken !== null) {
      router.replace(pathname);
    }
    if (startedRef.current || (status !== 'unknown' && linkToken === null)) {
      return;
    }
    startedRef.current = true;
    void startParentSession(linkToken).then((result) => {
      if (result !== null) {
        queryClient.setQueryData(parentQueryKeys.me, toParentMe(result));
      }
      useParentSessionStore.getState().setStatus(result === null ? 'none' : 'active');
    });
  }, [pathname, queryClient, router, searchParams, status]);

  return status;
}
