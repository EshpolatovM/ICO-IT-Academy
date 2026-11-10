import { parentTokenSchema, Role } from '@lms/shared';
import type { ParentExchangeResponse, ParentMeResponse } from '@lms/shared';

import { isApiError, UNKNOWN_ERROR_MESSAGE } from '@/lib/api';
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

async function exchangeStoredTokens(): Promise<ParentExchangeResponse | null> {
  try {
    return await parentAccessApi.exchange();
  } catch (_error) {
    return null;
  }
}

/**
 * Ota-ona sessiyasini boshlash (docs/02 §5.1, docs/10 §3):
 * 1) havola tokeni bo'lsa — `{tokens:[t], merge:true}`;
 * 2) bo'lmasa (yoki havola yaroqsiz bo'lsa) — body'siz exchange (cookie'dagi tokenlar bilan).
 * Natija: farzandlar ro'yxati (sessiya bor) yoki `null` (token kiritish formasi).
 */
export async function startParentSession(
  linkToken: string | null,
): Promise<ParentExchangeResponse | null> {
  const fromLink = linkToken === null ? null : await exchangeLinkToken(linkToken);
  return fromLink ?? (await exchangeStoredTokens());
}
