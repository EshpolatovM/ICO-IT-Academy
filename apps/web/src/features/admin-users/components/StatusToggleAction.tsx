'use client';

import { useState } from 'react';

import { UserStatus } from '@lms/shared';
import type { ManagedUserBase } from '@lms/shared';

import { Alert, Button, ConfirmDialog } from '@/components/ui';
import type { ButtonSize } from '@/components/ui';

import { useUpdateUser } from '../hooks/useUpdateUser';
import { fullName } from '../lib/format';

import { errorMessage } from './QueryErrorAlert';

import type { ManagedUserKind } from '../types/admin-users.types';

export interface StatusToggleActionProps<T extends ManagedUserBase> {
  kind: ManagedUserKind;
  user: T;
  /** `PATCH` — `{ status }`. */
  update: (id: string, body: { status: UserStatus }) => Promise<T>;
  size?: ButtonSize;
}

const DEACTIVATE_DESCRIPTION =
  'Foydalanuvchi tizimdan darhol chiqariladi va qayta kira olmaydi. Keyin yana faollashtirish mumkin.';
const ACTIVATE_DESCRIPTION =
  'Foydalanuvchi yana tizimga kira oladi (qaytadan login qilishi kerak).';

/** Deaktivatsiya / aktivatsiya (`PATCH status`) — tasdiqlash oynasi bilan. */
export function StatusToggleAction<T extends ManagedUserBase>({
  kind,
  user,
  update,
  size = 'sm',
}: StatusToggleActionProps<T>) {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateUser(kind, update);
  const deactivate = user.status === UserStatus.ACTIVE;
  const name = fullName(user);
  const status = deactivate ? UserStatus.INACTIVE : UserStatus.ACTIVE;

  const changeOpen = (next: boolean) => {
    mutation.reset();
    setOpen(next);
  };

  return (
    <>
      <Button
        variant={deactivate ? 'danger' : 'secondary'}
        size={size}
        onClick={() => {
          changeOpen(true);
        }}
      >
        {deactivate ? 'Deaktivatsiya' : 'Faollashtirish'}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={changeOpen}
        title={deactivate ? `${name}: deaktivatsiya qilinsinmi?` : `${name}: faollashtirilsinmi?`}
        description={deactivate ? DEACTIVATE_DESCRIPTION : ACTIVATE_DESCRIPTION}
        confirmLabel={deactivate ? 'Deaktivatsiya qilish' : 'Faollashtirish'}
        variant={deactivate ? 'danger' : 'primary'}
        loading={mutation.isPending}
        onConfirm={() => {
          mutation.mutate(
            { id: user.id, body: { status } },
            {
              onSuccess: () => {
                setOpen(false);
              },
            },
          );
        }}
      >
        {mutation.isError ? <Alert variant="danger">{errorMessage(mutation.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
