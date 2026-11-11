import { QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';

import { createQueryClient } from '@/lib/query';

import type { QueryClient } from '@tanstack/react-query';
import type { RenderHookResult, RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

/** Komponentni yangi `QueryClient` bilan chizadi (har testga alohida kesh). */
export function renderWithQuery(ui: ReactElement): RenderResult & { queryClient: QueryClient } {
  const queryClient = createQueryClient();
  const result = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return { ...result, queryClient };
}

/** Hook'ni yangi `QueryClient` bilan ishga tushiradi. */
export function renderHookWithQuery<TResult>(
  hook: () => TResult,
): RenderHookResult<TResult, unknown> & { queryClient: QueryClient } {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(hook, { wrapper }), queryClient };
}
