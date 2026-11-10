import type { ParentExchangeRequest, ParentExchangeResponse, ParentMeResponse } from '@lms/shared';

import { apiRequest } from '@/lib/api';

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

  /**
   * "Chiqish" (docs/12 §1): `@Public`, sessiya talab qilinmaydi — `ps` muddati o'tgan bo'lsa ham
   * ikkala cookie (`ps`, `parent_tokens`) o'chiriladi, 204. CSRF sarlavhasini `apiRequest` qo'shadi.
   */
  logout: () => apiRequest<undefined>('/auth/parent/logout', { method: 'POST', auth: false }),
};
