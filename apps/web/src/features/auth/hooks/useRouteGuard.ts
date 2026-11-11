'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { resolveAccess } from '../lib/resolve-access';

import { useAuthSession } from './useAuthSession';

import type { GuardArea, GuardDecision } from '../types/auth.types';

/** Rol bo'yicha route guard: qaror qaytaradi va kerak bo'lsa yo'naltiradi (`router.replace`). */
export function useRouteGuard(area: GuardArea): GuardDecision {
  const router = useRouter();
  const decision = resolveAccess(area, useAuthSession());
  const target = decision.type === 'redirect' ? decision.to : null;

  useEffect(() => {
    if (target !== null) {
      router.replace(target);
    }
  }, [router, target]);

  return decision;
}
