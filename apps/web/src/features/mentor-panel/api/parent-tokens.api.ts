import type {
  CreateParentTokenRequest,
  ParentTokenCreatedResponse,
  ParentTokensListResponse,
} from '@lms/shared';

import { apiRequest, itemPath } from '@/lib/api';

function tokensPath(studentId: string): string {
  return `${itemPath('/students', studentId)}/parent-tokens`;
}

function tokenPath(studentId: string, tokenId: string): string {
  return itemPath(tokensPath(studentId), tokenId);
}

/**
 * Ota-ona tokenlari (docs/12 §2.1, docs/02 §5): SA A M. Yaratish va qayta yaratish javobidagi
 * `token`/`link` — FAQAT bir marta, keshga yozilmaydi.
 */
export const parentTokensApi = {
  list: (studentId: string) => apiRequest<ParentTokensListResponse>(tokensPath(studentId)),

  create: (studentId: string, body: CreateParentTokenRequest) =>
    apiRequest<ParentTokenCreatedResponse>(tokensPath(studentId), { method: 'POST', body }),

  revoke: (studentId: string, tokenId: string) =>
    apiRequest<undefined>(tokenPath(studentId, tokenId), { method: 'DELETE' }),

  /** Eski token bekor qilinadi va yangisi yaratiladi (bitta tranzaksiya). */
  regenerate: (studentId: string, tokenId: string) =>
    apiRequest<ParentTokenCreatedResponse>(`${tokenPath(studentId, tokenId)}/regenerate`, {
      method: 'POST',
    }),
};
