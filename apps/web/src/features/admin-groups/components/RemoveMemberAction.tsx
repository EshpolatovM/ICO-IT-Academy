'use client';

import { useState } from 'react';

import type { AdminGroupMember } from '@lms/shared';

import { Alert, Button, ConfirmDialog } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { personName } from '@/lib/format';

import { useRemoveGroupMember } from '../hooks/useGroupMutations';

export interface RemoveMemberActionProps {
  groupId: string;
  groupName: string;
  member: AdminGroupMember;
}

/** A'zoni guruhdan chiqarish (`DELETE …/members/:studentId`) — tasdiqlash oynasi bilan. */
export function RemoveMemberAction({ groupId, groupName, member }: RemoveMemberActionProps) {
  const [open, setOpen] = useState(false);
  const remove = useRemoveGroupMember(groupId);
  const name = personName(member);

  const changeOpen = (next: boolean) => {
    remove.reset();
    setOpen(next);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${name} — chiqarish`}
        onClick={() => {
          changeOpen(true);
        }}
      >
        Chiqarish
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={changeOpen}
        title={`${name}: ${groupName} guruhidan chiqarilsinmi?`}
        description="Student guruhsiz qoladi; keyin boshqa guruhga qo'shish mumkin."
        confirmLabel="Chiqarish"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() => {
          remove.mutate(member.id, {
            onSuccess: () => {
              setOpen(false);
            },
          });
        }}
      >
        {remove.isError ? <Alert variant="danger">{errorMessage(remove.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
