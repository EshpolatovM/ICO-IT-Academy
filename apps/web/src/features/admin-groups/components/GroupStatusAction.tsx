'use client';

import { useState } from 'react';

import { GroupStatus } from '@lms/shared';
import type { AdminGroupDetail } from '@lms/shared';

import { Alert, Button, ConfirmDialog } from '@/components/ui';

import { useUpdateGroup } from '../hooks/useGroupMutations';
import { errorText } from '../lib/group-errors';

const ARCHIVE_DESCRIPTION =
  "Guruhga yangi student qo'shib bo'lmaydi va u mentor ro'yxatidan chiqadi. A'zoliklar saqlanadi, keyin qayta faollashtirish mumkin.";
const ACTIVATE_DESCRIPTION = "Guruh yana faol bo'ladi va mentor uni qayta ko'radi.";

/** Arxivlash / qayta faollashtirish (`PATCH { status }`) — tasdiqlash oynasi bilan. */
export function GroupStatusAction({ group }: { group: AdminGroupDetail }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateGroup(group.id);
  const archive = group.status === GroupStatus.ACTIVE;

  const changeOpen = (next: boolean) => {
    update.reset();
    setOpen(next);
  };

  return (
    <>
      <Button
        variant={archive ? 'danger' : 'secondary'}
        onClick={() => {
          changeOpen(true);
        }}
      >
        {archive ? 'Arxivlash' : 'Qayta faollashtirish'}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={changeOpen}
        title={archive ? `${group.name}: arxivlansinmi?` : `${group.name}: faollashtirilsinmi?`}
        description={archive ? ARCHIVE_DESCRIPTION : ACTIVATE_DESCRIPTION}
        confirmLabel={archive ? 'Arxivlash' : 'Faollashtirish'}
        variant={archive ? 'danger' : 'primary'}
        loading={update.isPending}
        onConfirm={() => {
          const status = archive ? GroupStatus.ARCHIVED : GroupStatus.ACTIVE;
          update.mutate(
            { status },
            {
              onSuccess: () => {
                setOpen(false);
              },
            },
          );
        }}
      >
        {update.isError ? <Alert variant="danger">{errorText(update.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
