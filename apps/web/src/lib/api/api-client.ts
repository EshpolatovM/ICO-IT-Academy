import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from '@lms/shared';

import { useAuthStore } from '@/stores/auth.store';

import { networkError, toApiError } from './api-error';
import { API_BASE_PATH, HttpStatus } from './api.constants';
import { refreshAccessToken } from './refresh-session';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  /** JSON ga aylantiriladi. */
  body?: unknown;
  /**
   * `false` — `Authorization` yuborilmaydi va 401 da refresh qilinmaydi: public endpointlar
   * (login, ota-ona exchange) va ota-ona sessiyasi (`ps` cookie) bilan ishlaydigan so'rovlar.
   */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildHeaders(hasBody: boolean, accessToken: string | null): Headers {
  const headers = new Headers({
    Accept: 'application/json',
    [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
  });
  if (hasBody) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken !== null) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
}

async function send(
  path: string,
  options: ApiRequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const hasBody = options.body !== undefined;
  try {
    return await fetch(`${API_BASE_PATH}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: buildHeaders(hasBody, accessToken),
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw networkError();
  }
}

/**
 * 401 olgan so'rov uchun yangi token: agar boshqa so'rov token'ni allaqachon yangilagan bo'lsa —
 * o'shani ishlatadi, aks holda (umumiy, single-flight) refresh'ni kutadi.
 */
function renewAccessToken(failedToken: string): Promise<string | null> {
  const current = useAuthStore.getState().accessToken;
  if (current !== null && current !== failedToken) {
    return Promise.resolve(current);
  }
  return refreshAccessToken();
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === HttpStatus.NO_CONTENT) {
    return undefined as T;
  }
  const text = await response.text();
  return (text === '' ? undefined : JSON.parse(text)) as T;
}

/**
 * Yagona API so'rov funksiyasi (docs/12 §0): base `/api/v1`, `Authorization: Bearer`, cookie'lar,
 * JSON. Xato javob — tiplangan `ApiError`. 401 bo'lsa bir marta refresh → so'rov qayta yuboriladi;
 * refresh muvaffaqiyatsiz — store tozalanadi (guard login sahifasiga o'tkazadi) va xato tashlanadi.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const accessToken = options.auth === false ? null : useAuthStore.getState().accessToken;
  let response = await send(path, options, accessToken);
  if (response.status === HttpStatus.UNAUTHORIZED && accessToken !== null) {
    const renewed = await renewAccessToken(accessToken);
    if (renewed !== null) {
      response = await send(path, options, renewed);
    }
  }
  if (!response.ok) {
    throw await toApiError(response);
  }
  return parseBody<T>(response);
}
