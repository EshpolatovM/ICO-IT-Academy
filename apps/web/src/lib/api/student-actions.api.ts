import type {
  CreateParentTokenRequest,
  ParentTokenCreatedResponse,
  ParentTokensListResponse,
  PasswordResetResponse,
} from '@lms/shared';

import { apiRequest } from './api-client';
import { itemPath } from './request-path';

/** Student ustidagi umumiy amallar (`/students/:id/...`): admin va mentor panellari birga ishlatadi. */
const STUDENTS_PATH = '/students';

function studentPath(studentId: string): string {
  return itemPath(STUDENTS_PATH, studentId);
}

function tokensPath(studentId: string): string {
  return `${studentPath(studentId)}/parent-tokens`;
}

function tokenPath(studentId: string, tokenId: string): string {
  return itemPath(tokensPath(studentId), tokenId);
}

/** `POST /students/:id/reset-password` (docs/12 §2.1): SA A M (mentor — `@StudentScope`). */
export function resetStudentPassword(studentId: string): Promise<PasswordResetResponse> {
  return apiRequest<PasswordResetResponse>(`${studentPath(studentId)}/reset-password`, {
    method: 'POST',
  });
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
