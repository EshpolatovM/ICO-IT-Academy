'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAuthStore } from '@/stores/auth.store';

import { restoreSession } from '../api/session';

import type { AccessContext } from '../lib/resolve-access';

/** Joriy auth holati; sessiya hali noma'lum bo'lsa — uni (bir marta) tiklashni boshlaydi. */
export function useAuthSession(): AccessContext {
  const context = useAuthStore(
    useShallow((state) => ({ status: state.status, user: state.user, lastRole: state.lastRole })),
  );
  const { status } = context;

  useEffect(() => {
    if (status === 'unknown') {
      void restoreSession();
    }
  }, [status]);

  return context;
}
