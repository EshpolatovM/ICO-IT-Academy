import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from '@lms/shared';
import type { AccessTokenResponse } from '@lms/shared';

import { useAuthStore } from '@/stores/auth.store';

import { API_BASE_PATH } from './api.constants';

const REFRESH_PATH = `${API_BASE_PATH}/auth/refresh`;

/** Hozir bajarilayotgan refresh — barcha chaqiruvchilar shuni kutadi. */
let inflightRefresh: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const response = await fetch(REFRESH_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE },
    });
    if (!response.ok) {
      useAuthStore.getState().clear();
      return null;
    }
    const { accessToken } = (await response.json()) as AccessTokenResponse;
    useAuthStore.getState().setAccessToken(accessToken);
    return accessToken;
  } catch (_error) {
    useAuthStore.getState().clear();
    return null;
  }
}

/**
 * `POST /auth/refresh` (rotation, `rt` cookie + `X-Requested-With`, docs/02 §3, §6) — **single-flight**:
 * bir vaqtda kelgan barcha chaqiruvlar BITTA so'rovni kutadi. Parallel refresh'lar bitta `rt` ni
 * ikki marta yuborib, backend'dagi reuse detection orqali butun sessiya oilasini bekor qilardi.
 *
 * Muvaffaqiyatda yangi access token store'ga yoziladi va qaytariladi; aks holda store tozalanadi
 * (`anonymous` → route guard login sahifasiga yo'naltiradi) va `null` qaytadi.
 */
export function refreshAccessToken(): Promise<string | null> {
  inflightRefresh ??= performRefresh().finally(() => {
    inflightRefresh = null;
  });
  return inflightRefresh;
}
