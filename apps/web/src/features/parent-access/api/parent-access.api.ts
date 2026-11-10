import { ErrorCode } from '@lms/shared';
import type { ParentExchangeRequest, ParentExchangeResponse, ParentMeResponse } from '@lms/shared';

import { apiRequest, isApiError } from '@/lib/api';

/**
 * Ota-ona endpointlari (docs/12 §1, docs/02 §5.1). Hammasi `auth: false`: Bearer yuborilmaydi,
 * sessiya `ps` cookie'da (bir brauzerda student ham kirgan bo'lsa ham ota-ona sessiyasi ishlatiladi).
 */
export const parentAccessApi = {
  /** `tokens` berilmasa — body'siz: `parent_tokens` cookie'dagi tokenlar bilan sessiya yangilanadi. */
  exchange: (tokens?: readonly string[]) => {
    const body: ParentExchangeRequest | undefined =
      tokens === undefined ? undefined : { tokens: [...tokens], merge: true };
    return apiRequest<ParentExchangeResponse>('/auth/parent/exchange', {
      method: 'POST',
      body,
      auth: false,
    });
  },

  me: () => apiRequest<ParentMeResponse>('/auth/me', { auth: false }),

  logout: () => apiRequest<undefined>('/auth/logout', { method: 'POST', auth: false }),
};

function isUnauthorized(error: unknown): boolean {
  return isApiError(error) && error.code === ErrorCode.UNAUTHORIZED;
}

/**
 * "Chiqish" — ikkala cookie ham o'chirilishi kerak (docs/02 §5.1). `ps` muddati o'tgan bo'lsa
 * logout 401 qaytaradi va `parent_tokens` qolib ketadi — shunda avval body'siz exchange
 * (sessiyani yangilash yoki yaroqsiz cookie'larni server tozalaydi), so'ng qayta logout.
 */
export async function logoutParent(): Promise<void> {
  try {
    await parentAccessApi.logout();
  } catch (error) {
    if (!isUnauthorized(error)) {
      throw error;
    }
    try {
      await parentAccessApi.exchange();
      await parentAccessApi.logout();
    } catch (retryError) {
      if (!isUnauthorized(retryError)) {
        throw retryError;
      }
    }
  }
}
