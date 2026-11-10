'use client';

import { useRouteGuard } from '../hooks/useRouteGuard';

import { FullPageSpinner } from './FullPageSpinner';

import type { GuardArea } from '../types/auth.types';
import type { ReactNode } from 'react';

export interface AuthGuardProps {
  /** Himoyalanadigan joy: rol zonasi, `change-password` yoki `guest` (login sahifalari). */
  area: GuardArea;
  children: ReactNode;
}

/**
 * Client tarafdagi route guard (layout darajasida). Sessiya tiklanguncha va yo'naltirish paytida
 * `Spinner`; ruxsat bo'lsa — kontent. Haqiqiy himoya backend'da (RBAC), bu faqat UX.
 */
export function AuthGuard({ area, children }: AuthGuardProps) {
  const decision = useRouteGuard(area);
  if (decision.type !== 'allow') {
    return <FullPageSpinner />;
  }
  return <>{children}</>;
}
