'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { createQueryClient } from './query-client';

import type { ReactNode } from 'react';

/** Yagona TanStack Query provider (server ma'lumotlari faqat shu orqali). */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
