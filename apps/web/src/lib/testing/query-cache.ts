import { waitFor } from '@testing-library/react';
import { expect } from 'vitest';

import type { QueryClient } from '@tanstack/react-query';

/**
 * Maxfiy qiymat (vaqtinchalik parol) react-query keshida qolmaganini tekshiradi: mutatsiyalar
 * keshi bo'shaydi, query'lar ma'lumotida qiymat yo'q.
 */
export async function expectSecretNotCached(
  queryClient: QueryClient,
  secret: string,
): Promise<void> {
  await waitFor(() => {
    expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
  });
  const data = queryClient
    .getQueryCache()
    .getAll()
    .map((query) => query.state.data);
  expect(JSON.stringify(data)).not.toContain(secret);
}
