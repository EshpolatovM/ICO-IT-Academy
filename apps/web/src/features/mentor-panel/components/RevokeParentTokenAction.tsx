'use client';

import { useState } from 'react';

import { Alert, Button, ConfirmDialog } from '@/components/ui';
import { errorMessage } from '@/lib/api';

import { useRevokeParentToken } from '../hooks/useParentTokens';
import { parentTokenName } from '../lib/parent-token-name';

import type { ParentTokenActionProps } from '../types/mentor-panel.types';

/** Tokenni bekor qilish (`DELETE`) — tasdiqlash oynasi bilan; ota-ona sessiyasi tugaydi. */
export function RevokeParentTokenAction({
  studentId,
  token,
}: Omit<ParentTokenActionProps, 'studentName'>) {
  const [open, setOpen] = useState(false);
  const revoke = useRevokeParentToken(studentId);
  const name = parentTokenName(token);

  const changeOpen = (next: boolean) => {
    revoke.reset();
    setOpen(next);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${name} — bekor qilish`}
        onClick={() => {
          changeOpen(true);
        }}
      >
        Bekor qilish
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={changeOpen}
        title={`${name}: token bekor qilinsinmi?`}
        description="Bu havola va kod bilan endi kirib bo'lmaydi, ota-onaning joriy sessiyasi ham tugaydi."
        confirmLabel="Tokenni bekor qilish"
        cancelLabel="Yopish"
        variant="danger"
        loading={revoke.isPending}
        onConfirm={() => {
          revoke.mutate(token.id, {
            onSuccess: () => {
              setOpen(false);
            },
          });
        }}
      >
        {revoke.isError ? <Alert variant="danger">{errorMessage(revoke.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
