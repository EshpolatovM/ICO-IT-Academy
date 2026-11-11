import { Role } from '@lms/shared';
import type { AuthUser, MeResponse } from '@lms/shared';

import { isSessionRejectedError, refreshAccessToken } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

import { authApi } from './auth.api';

function isAccountUser(me: MeResponse): me is AuthUser {
  return me.role !== Role.PARENT;
}

/** Store'dagi access token bilan `GET /auth/me` → sessiya identifikatsiyasini (rol, `mcp`) yangilaydi. */
export async function loadSessionUser(): Promise<AuthUser | null> {
  const me = await authApi.me();
  const { accessToken, setSession, clear } = useAuthStore.getState();
  if (!isAccountUser(me) || accessToken === null) {
    clear();
    return null;
  }
  setSession(accessToken, me);
  return me;
}

async function performRestore(): Promise<void> {
  try {
    if ((await refreshAccessToken()) !== null) {
      await loadSessionUser();
    }
  } catch (error) {
    const store = useAuthStore.getState();
    if (isSessionRejectedError(error)) {
      store.clear();
    } else {
      store.markUnavailable();
    }
  }
}

let inflightRestore: Promise<void> | null = null;

/**
 * Sahifa yangilanganda sessiyani tiklash (docs/02 §3): access token faqat xotirada, shuning uchun
 * `rt` cookie bilan `POST /auth/refresh` → `GET /auth/me`. Single-flight: bir vaqtda bir nechta
 * guard (yoki React StrictMode'ning qayta effektlari) bitta tiklashni kutadi. Sessiya rad etilsa
 * (401/403) — `anonymous`; vaqtinchalik xato (tarmoq, 5xx) — `unavailable` (M6).
 */
export function restoreSession(): Promise<void> {
  inflightRestore ??= performRestore().finally(() => {
    inflightRestore = null;
  });
  return inflightRestore;
}
