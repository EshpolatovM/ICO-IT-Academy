'use client';

import { ContentStatus } from '@lms/shared';

import { usePublishPath, useUpdatePath } from '../hooks/usePathMutations';

import { StatusToggleButton } from './StatusToggleButton';

export interface PathStatusToggleProps {
  path: { id: string; title: string; status: ContentStatus };
}

/** Yo'l: nashr — `POST …/publish`, yashirish — `PATCH { status: DRAFT }` (T-1). Kaskadsiz. */
export function PathStatusToggle({ path }: PathStatusToggleProps) {
  const publish = usePublishPath(path.id);
  const update = useUpdatePath(path.id);
  return (
    <StatusToggleButton
      name={path.title}
      status={path.status}
      pending={publish.isPending || update.isPending}
      error={publish.error ?? update.error}
      onToggle={(next) => {
        if (next === ContentStatus.PUBLISHED) {
          publish.mutate(undefined);
        } else {
          update.mutate({ status: ContentStatus.DRAFT });
        }
      }}
    />
  );
}
