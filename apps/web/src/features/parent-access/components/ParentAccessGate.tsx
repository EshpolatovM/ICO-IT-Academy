'use client';

import { Suspense } from 'react';

import { FullPageSpinner } from '@/features/auth';

import { useParentBootstrap } from '../hooks/useParentBootstrap';

import { ParentSignIn } from './ParentSignIn';

import type { ReactNode } from 'react';

function ParentAccessGateInner({ children }: { children: ReactNode }) {
  const status = useParentBootstrap();
  if (status === 'unknown') {
    return <FullPageSpinner />;
  }
  if (status === 'none') {
    return <ParentSignIn />;
  }
  return <>{children}</>;
}

/**
 * Ota-ona zonasi guard'i: sessiya tekshirilguncha `Spinner`, sessiya bo'lmasa — kod kiritish
 * formasi, bo'lsa — panel. `useSearchParams` uchun `Suspense` chegarasi shu yerda.
 */
export function ParentAccessGate({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <ParentAccessGateInner>{children}</ParentAccessGateInner>
    </Suspense>
  );
}
