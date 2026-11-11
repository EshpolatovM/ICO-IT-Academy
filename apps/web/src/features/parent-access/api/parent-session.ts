import { parentTokenSchema, Role } from '@lms/shared';
import type { ParentExchangeResponse, ParentMeResponse } from '@lms/shared';

import {
  HttpStatus,
  isApiError,
  NETWORK_ERROR_STATUS,
  SERVER_ERROR_MIN_STATUS,
  UNKNOWN_ERROR_MESSAGE,
} from '@/lib/api';
import { useParentSessionStore } from '@/stores/parent-session.store';

import { parentAccessApi } from './parent-access.api';

/** Havoladagi token formati noto'g'ri bo'lsa (so'rov yuborilmaydi). */
export const INVALID_LINK_MESSAGE = "Havola noto'g'ri yoki buzilgan. Kodni qo'lda kiriting.";

export function toParentMe({ children }: ParentExchangeResponse): ParentMeResponse {
  return { role: Role.PARENT, children };
}

function errorMessage(error: unknown): string {
  return isApiError(error) ? error.message : UNKNOWN_ERROR_MESSAGE;
}

async function exchangeLinkToken(linkToken: string): Promise<ParentExchangeResponse | null> {
  const store = useParentSessionStore.getState();
  if (!parentTokenSchema.safeParse(linkToken).success) {
    store.setLinkError(INVALID_LINK_MESSAGE);
    return null;
  }
  try {
    return await parentAccessApi.exchange([linkToken]);
  } catch (error) {
    store.setLinkError(errorMessage(error));
    return null;
  }
}

function isUnauthorized(error: unknown): boolean {
  return isApiError(error) && error.status === HttpStatus.UNAUTHORIZED;
}

/** Server javob bermadi yoki o'zi xato qildi (tarmoq, 5xx) — sessiya holatini aniqlab bo'lmaydi. */
function isUnavailable(error: unknown): boolean {
  if (!isApiError(error)) {
    return true;
  }
  return error.status === NETWORK_ERROR_STATUS || error.status >= SERVER_ERROR_MIN_STATUS;
}

/** Body'siz exchange (`parent_tokens` cookie). Rad etilsa — `null` (kod formasi). */
async function exchangeStoredTokens(): Promise<ParentMeResponse | null> {
  try {
    return toParentMe(await parentAccessApi.exchange());
  } catch (error) {
    if (isUnavailable(error)) {
      throw error;
    }
    return null;
  }
}

/**
 * Mavjud sessiyani davom ettirish (docs/02 §5.1, H3): avval `GET /auth/me` (`ps` cookie) — amalda
 * bo'lsa exchange CHAQIRILMAYDI (IP limiti behuda to'lmaydi). Faqat 401 bo'lsa — body'siz exchange.
 */
async function resumeParentSession(): Promise<ParentMeResponse | null> {
  try {
    return await parentAccessApi.me();
  } catch (error) {
    if (!isUnauthorized(error)) {
      throw error;
    }
  }
  return exchangeStoredTokens();
}

/**
 * Ota-ona sessiyasini boshlash (docs/02 §5.1, docs/10 §3):
 * 1) havola tokeni bo'lsa — `{tokens:[t], merge:true}`;
 * 2) bo'lmasa (yoki havola yaroqsiz bo'lsa) — `GET /auth/me`, u 401 bo'lsa body'siz exchange.
 * Natija: farzandlar (sessiya bor) yoki `null` (token kiritish formasi). Server bilan aloqa bo'lmasa
 * (tarmoq, 5xx) — xato tashlanadi (`unavailable`).
 */
export async function startParentSession(
  linkToken: string | null,
): Promise<ParentMeResponse | null> {
  const fromLink = linkToken === null ? null : await exchangeLinkToken(linkToken);
  return fromLink === null ? resumeParentSession() : toParentMe(fromLink);
}
