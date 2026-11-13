'use client';

import type { ContentStatus } from '@lms/shared';

import { StatusToggleButton } from './StatusToggleButton';

/** `PATCH { status }` mutatsiyasining kerakli qismi (bo'lim, mavzu, dars). */
export interface StatusUpdateMutation {
  mutate: (body: { status: ContentStatus }) => void;
  isPending: boolean;
  error: Error | null;
}

export interface NodeStatusToggleProps {
  name: string;
  status: ContentStatus;
  update: StatusUpdateMutation;
}

/** Bo'lim/mavzu/dars holatini tezkor almashtirish (`PATCH status`, kaskadsiz — Q-1). */
export function NodeStatusToggle({ name, status, update }: NodeStatusToggleProps) {
  return (
    <StatusToggleButton
      name={name}
      status={status}
      pending={update.isPending}
      error={update.error}
      onToggle={(next) => {
        update.mutate({ status: next });
      }}
    />
  );
}
