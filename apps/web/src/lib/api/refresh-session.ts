import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, ErrorCode } from '@lms/shared';
import type { AccessTokenResponse } from '@lms/shared';

import { useAuthStore } from '@/stores/auth.store';

import { isSessionRejectedError, networkError, toApiError } from './api-error';
import { API_BASE_PATH } from './api.constants';
import { withRefreshLock } from './refresh-lock';

const REFRESH_PATH = `${API_BASE_PATH}/auth/refresh`;

/**
 * `REFRESH_SUPERSEDED` dan keyin qayta urinishdan oldingi kutish: boshqa tab (yoki parallel so'rov)
 * yangi `rt` cookie'ni yozib ulgurishi uchun qisqa pauza.
 */
export const REFRESH_SUPERSEDED_RETRY_DELAY_MS = 300;

/** Bitta refresh so'rovining natijasi: yangi token, "boshqa so'rov yangilagan" yoki sessiya rad etilgan. */
type RefreshAttempt =
  { type: 'renewed'; accessToken: string } | { type: 'superseded' } | { type: 'rejected' };

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function postRefresh(): Promise<Response> {
  try {
    return await fetch(REFRESH_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE },
    });
  } catch (_error) {
    throw networkError();
  }
}

/**
 * Bitta `POST /auth/refresh`. Tarmoq xatosi, 5xx, 429 va boshqa kutilmagan javoblar — `ApiError`
 * bo'lib tashlanadi (sessiya holati o'zgarmaydi, keyingi so'rovda yana urinadi).
 */
async function attemptRefresh(): Promise<RefreshAttempt> {
  const response = await postRefresh();
  if (response.ok) {
    const { accessToken } = (await response.json()) as AccessTokenResponse;
    return { type: 'renewed', accessToken };
  }
  const error = await toApiError(response);
  if (error.code === ErrorCode.REFRESH_SUPERSEDED) {
    return { type: 'superseded' };
  }
  if (isSessionRejectedError(error)) {
    return { type: 'rejected' };
  }
  throw error;
}

/** `REFRESH_SUPERSEDED` bo'lsa — qisqa kutib BIR marta qayta uradi (cookie allaqachon yangi). */
async function refreshWithRetry(): Promise<RefreshAttempt> {
  const first = await attemptRefresh();
  if (first.type !== 'superseded') {
    return first;
  }
  await wait(REFRESH_SUPERSEDED_RETRY_DELAY_MS);
  return attemptRefresh();
}

async function performRefresh(): Promise<string | null> {
  const result = await withRefreshLock(refreshWithRetry);
  if (result.type === 'renewed') {
    useAuthStore.getState().setAccessToken(result.accessToken);
    return result.accessToken;
  }
  useAuthStore.getState().clear();
  return null;
}

/** Hozir bajarilayotgan refresh — shu tabdagi barcha chaqiruvchilar shuni kutadi. */
let inflightRefresh: Promise<string | null> | null = null;

/**
 * `POST /auth/refresh` (rotation, `rt` cookie + `X-Requested-With`, docs/02 §3, §6):
 * - tab ichida **single-flight** — bir vaqtdagi chaqiruvlar BITTA so'rovni kutadi;
 * - tablar orasida **Web Locks** qulfi (`refresh-lock.ts`) — boshqa tab qulfni kutib, so'ng yangi
 *   cookie bilan o'zi refresh qiladi (bitta `rt` ikki marta yuborilmaydi);
 * - `REFRESH_SUPERSEDED` (grace oynasi) — logout emas, qisqa kutib bir marta qayta urinish.
 *
 * Natija: yangi access token (store'ga yoziladi) yoki `null` — sessiya rad etildi (401/403 yoki
 * qayta urinish ham muvaffaqiyatsiz), store tozalanadi. Vaqtinchalik xato (tarmoq, 5xx) — `ApiError`
 * tashlanadi va store o'zgarmaydi (M6).
 */
export function refreshAccessToken(): Promise<string | null> {
  inflightRefresh ??= performRefresh().finally(() => {
    inflightRefresh = null;
  });
  return inflightRefresh;
}
