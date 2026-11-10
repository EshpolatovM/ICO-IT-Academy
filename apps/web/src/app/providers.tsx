'use client';

import '@/lib/forms/zod-locale';
import { QueryProvider } from '@/lib/query';

import type { ReactNode } from 'react';

/** Client provider'lar (bitta joyda): TanStack Query; zod xabarlari o'zbekcha. */
export function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
