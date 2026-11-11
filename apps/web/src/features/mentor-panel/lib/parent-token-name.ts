import type { ParentTokenSummary } from '@lms/shared';

/** Token nomi (tasdiqlash oynalari va `aria-label` uchun): yorliq yoki prefiks. */
export function parentTokenName(token: Pick<ParentTokenSummary, 'label' | 'prefix'>): string {
  return token.label ?? `${token.prefix}…`;
}
