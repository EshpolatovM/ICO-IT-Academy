'use client';

import type { ContentStatus } from '@lms/shared';

import { Button, Text } from '@/components/ui';

import { contentErrorText } from '../lib/content-errors';
import { toggledStatus, toggleStatusLabel } from '../lib/content-status';

export interface StatusToggleButtonProps {
  name: string;
  status: ContentStatus;
  pending: boolean;
  error: Error | null;
  onToggle: (next: ContentStatus) => void;
}

/** Tezkor holat tugmasi: "Nashr qilish" ↔ "Yashirish" (kaskadsiz, Q-1). Xato — yonida. */
export function StatusToggleButton({
  name,
  status,
  pending,
  error,
  onToggle,
}: StatusToggleButtonProps) {
  const label = toggleStatusLabel(status);
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        aria-label={`${label}: ${name}`}
        loading={pending}
        onClick={() => {
          onToggle(toggledStatus(status));
        }}
      >
        {label}
      </Button>
      {error !== null ? (
        <Text as="span" variant="danger" role="alert">
          {contentErrorText(error)}
        </Text>
      ) : null}
    </>
  );
}
