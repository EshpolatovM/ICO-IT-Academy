'use client';

import { useState } from 'react';

import { Alert, Button, ConfirmDialog } from '@/components/ui';

import { contentErrorText } from '../lib/content-errors';

/** O'chirish mutatsiyasining kerakli qismi (`useDelete*` hook'lari natijasi). */
export interface DeleteMutation {
  mutate: (variables: undefined, options: { onSuccess: () => void }) => void;
  isPending: boolean;
  error: Error | null;
  reset: () => void;
}

export interface DeleteActionProps {
  /** O'chiriladigan element nomi (sarlavha va tugma aria-label'i uchun). */
  name: string;
  mutation: DeleteMutation;
  triggerLabel?: string;
  description?: string;
  onDeleted?: () => void;
}

const DEFAULT_DESCRIPTION = "Ichidagi hamma narsa ham o'chadi. Bu amalni qaytarib bo'lmaydi.";

/** "O'chirish" + tasdiqlash oynasi; 409 bo'lsa sababi oynada ko'rinadi (§2.4). */
export function DeleteAction({
  name,
  mutation,
  triggerLabel = "O'chirish",
  description = DEFAULT_DESCRIPTION,
  onDeleted,
}: DeleteActionProps) {
  const [open, setOpen] = useState(false);
  const changeOpen = (next: boolean) => {
    mutation.reset();
    setOpen(next);
  };
  const confirm = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        onDeleted?.();
      },
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${triggerLabel}: ${name}`}
        onClick={() => {
          changeOpen(true);
        }}
      >
        {triggerLabel}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={changeOpen}
        title={`${name}: o'chirilsinmi?`}
        description={description}
        confirmLabel="O'chirish"
        variant="danger"
        loading={mutation.isPending}
        onConfirm={confirm}
      >
        {mutation.error !== null ? (
          <Alert variant="danger">{contentErrorText(mutation.error)}</Alert>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
