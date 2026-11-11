'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useParentSessionStore } from '@/stores/parent-session.store';
import type { ParentSessionStatus } from '@/stores/parent-session.store';

import { parentQueryKeys } from '../api/parent-query-keys';
import { startParentSession } from '../api/parent-session';
import { readParentLinkToken } from '../lib/parent-link-token';

export interface ParentBootstrap {
  status: ParentSessionStatus;
  /** `unavailable` holatidan: sessiyani tekshirishni qaytadan boshlaydi. */
  retry: () => void;
}

/**
 * Havola tokenini o'qiydi va URL'dan DARHOL olib tashlaydi. Fragment serverga bormaydi — u
 * `history.replaceState` bilan tozalanadi (Next App Router bilan sinxron); eski `?t=` — router orqali.
 */
function consumeParentLinkToken(
  searchParams: Pick<URLSearchParams, 'get'>,
  replaceQuery: () => void,
): string | null {
  const { hash, pathname } = window.location;
  const link = readParentLinkToken({ hash, searchParams });
  if (link?.source === 'fragment') {
    window.history.replaceState(null, '', pathname);
  } else if (link?.source === 'query') {
    replaceQuery();
  }
  return link?.token ?? null;
}

/**
 * Ota-ona sahifasi ochilganda havola tokeni (`#t=`, S-70; eski `?t=` ham) URL'dan DARHOL olib
 * tashlanadi (docs/02 §4.5, §5.1), so'ng sessiya boshlanadi. Bir marta ishlaydi (StrictMode'da ham — `ref`).
 */
export function useParentBootstrap(): ParentBootstrap {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const status = useParentSessionStore((state) => state.status);
  const startedRef = useRef(false);

  useEffect(() => {
    const linkToken = consumeParentLinkToken(searchParams, () => {
      router.replace(pathname);
    });
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
