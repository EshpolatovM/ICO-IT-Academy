import { ContentStatus } from '@lms/shared';

import type { BadgeVariant, SelectOption, TreeListStatus } from '@/components/ui';

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: 'Qoralama',
  [ContentStatus.PUBLISHED]: 'Nashr qilingan',
  [ContentStatus.ARCHIVED]: 'Arxivlangan',
};

const CONTENT_STATUS_VARIANT: Record<ContentStatus, BadgeVariant> = {
  [ContentStatus.DRAFT]: 'neutral',
  [ContentStatus.PUBLISHED]: 'success',
  [ContentStatus.ARCHIVED]: 'warning',
};

export function contentStatusBadge(status: ContentStatus): TreeListStatus {
  return { label: CONTENT_STATUS_LABEL[status], variant: CONTENT_STATUS_VARIANT[status] };
}

export const CONTENT_STATUS_OPTIONS: readonly SelectOption[] = Object.values(ContentStatus).map(
  (status) => ({ value: status, label: CONTENT_STATUS_LABEL[status] }),
);

/** Tezkor tugma: nashr qilingan → qoralamaga ("Yashirish"), qolgani → nashr. */
export function toggledStatus(status: ContentStatus): ContentStatus {
  return status === ContentStatus.PUBLISHED ? ContentStatus.DRAFT : ContentStatus.PUBLISHED;
}

export function toggleStatusLabel(status: ContentStatus): string {
  return status === ContentStatus.PUBLISHED ? 'Yashirish' : 'Nashr qilish';
}
