'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { PARENT_LINK_TOKEN_PARAM } from '@lms/shared';

import { useParentSessionStore } from '@/stores/parent-session.store';
import type { ParentSessionStatus } from '@/stores/parent-session.store';

import { parentQueryKeys } from '../api/parent-query-keys';
import { startParentSession } from '../api/parent-session';

export interface ParentBootstrap {
  status: ParentSessionStatus;
  /** `unavailable` holatidan: sessiyani tekshirishni qaytadan boshlaydi. */
  retry: () => void;
}

/**
 * Ota-ona sahifasi ochilganda: `?t=` token URL'dan DARHOL olib tashlanadi (`router.replace`,
 * docs/02 §4.5), so'ng sessiya boshlanadi. Bir marta ishlaydi (StrictMode'da ham — `ref`).
 */
export function useParentBootstrap(): ParentBootstrap {
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
    const store = useParentSessionStore.getState();
    startParentSession(linkToken).then(
      (me) => {
        if (me !== null) {
          queryClient.setQueryData(parentQueryKeys.me, me);
        }
        store.setStatus(me === null ? 'none' : 'active');
      },
      () => {
        store.setStatus('unavailable');
      },
    );
  }, [pathname, queryClient, router, searchParams, status]);

  const retry = useCallback(() => {
    startedRef.current = false;
    useParentSessionStore.getState().setStatus('unknown');
  }, []);

  return { status, retry };
}
