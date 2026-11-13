import type { ContentStatus } from '@lms/shared';

import { Badge } from '@/components/ui';

import { contentStatusBadge } from '../lib/content-status';

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const { label, variant } = contentStatusBadge(status);
  return <Badge variant={variant}>{label}</Badge>;
}
