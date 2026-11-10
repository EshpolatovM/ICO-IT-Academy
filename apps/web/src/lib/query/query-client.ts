import { QueryClient } from '@tanstack/react-query';

import { HttpStatus, isApiError, SERVER_ERROR_MIN_STATUS } from '@/lib/api';

/** Server ma'lumotlari "yangi" hisoblanadigan vaqt (ms). */
const DEFAULT_STALE_TIME_MS = 30_000;
/** Vaqtinchalik (tarmoq/5xx) xatolarda qayta urinishlar soni. */
const MAX_QUERY_RETRIES = 2;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && error.status >= HttpStatus.BAD_REQUEST) {
    return error.status >= SERVER_ERROR_MIN_STATUS && failureCount < MAX_QUERY_RETRIES;
  }
  return failureCount < MAX_QUERY_RETRIES;
}

/** Yangi `QueryClient` (har bir brauzer sessiyasiga bitta, testlarda — har testga alohida). */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}
