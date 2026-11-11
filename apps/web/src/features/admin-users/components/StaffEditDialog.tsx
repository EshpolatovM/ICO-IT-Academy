'use client';

import { useState } from 'react';

import type { StaffAccount, UpdateStaffRequest } from '@lms/shared';

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';

import { useUpdateUser } from '../hooks/useUpdateUser';
import { changedFields } from '../lib/changed-fields';
import { STAFF_FIELDS } from '../lib/user-fields';
import { STAFF_SERVER_FIELDS, staffFormSchema } from '../lib/user-forms';

import { UserForm } from './UserForm';

import type { ManagedUserKind } from '../types/admin-users.types';

export interface StaffEditDialogProps<T extends StaffAccount> {
  kind: ManagedUserKind;
  user: T;
  update: (id: string, body: UpdateStaffRequest) => Promise<T>;
}

/** Xodimni tahrirlash: telefon, ism, familiya — faqat o'zgargan maydonlar yuboriladi. */
export function StaffEditDialog<T extends StaffAccount>({
  kind,
  user,
  update,
}: StaffEditDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateUser(kind, update);
  const initial = { phone: user.phone, firstName: user.firstName, lastName: user.lastName };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        Tahrirlash
      </Button>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            Tahrirlash: {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          schema={staffFormSchema}
          defaultValues={initial}
          fields={STAFF_FIELDS}
          serverFields={STAFF_SERVER_FIELDS}
          submitLabel="Saqlash"
          onCancel={() => {
            setOpen(false);
          }}
          onValid={async (values) => {
            const body = changedFields(values, initial);
            if (Object.keys(body).length > 0) {
              await mutation.mutateAsync({ id: user.id, body });
            }
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
