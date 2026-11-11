'use client';

import { useAuthStore } from '@/stores/auth.store';

import { useRouteGuard } from '../hooks/useRouteGuard';

import { FullPageSpinner } from './FullPageSpinner';
import { SessionUnavailable } from './SessionUnavailable';

import type { GuardArea } from '../types/auth.types';
import type { ReactNode } from 'react';

export interface AuthGuardProps {
  /** Himoyalanadigan joy: rol zonasi, `change-password` yoki `guest` (login sahifalari). */
  area: GuardArea;
  children: ReactNode;
}

/**
 * Client tarafdagi route guard (layout darajasida). Sessiya tiklanguncha va yo'naltirish paytida
 * `Spinner`; vaqtinchalik xatoda — "Qayta urinish"; ruxsat bo'lsa — kontent. Haqiqiy himoya
 * backend'da (RBAC), bu faqat UX.
 */
export function AuthGuard({ area, children }: AuthGuardProps) {
  const decision = useRouteGuard(area);
  const retryRestore = useAuthStore((state) => state.retryRestore);
  if (decision.type === 'unavailable') {
    return <SessionUnavailable onRetry={retryRestore} />;
  }
  if (decision.type !== 'allow') {
    return <FullPageSpinner />;
  }
  return <>{children}</>;
}
