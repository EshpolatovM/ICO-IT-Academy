import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { createQueryClient } from '@/lib/query';

import type { QueryClient } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

/** Komponentni yangi `QueryClient` bilan chizadi (har testga alohida kesh). */
export function renderWithQuery(ui: ReactElement): RenderResult & { queryClient: QueryClient } {
  const queryClient = createQueryClient();
  const result = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return { ...result, queryClient };
}
