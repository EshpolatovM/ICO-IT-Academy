'use client';

import type { StaffAccount } from '@lms/shared';

import { Stack } from '@/components/ui';
import { personName } from '@/lib/format';

import { STAFF_FIELDS } from '../lib/user-fields';
import { EMPTY_STAFF_FORM, STAFF_SERVER_FIELDS, staffFormSchema } from '../lib/user-forms';

import { CreateUserDialog } from './CreateUserDialog';
import { ResetPasswordAction } from './ResetPasswordAction';
import { StaffEditDialog } from './StaffEditDialog';
import { StatusToggleAction } from './StatusToggleAction';
import { createdAtColumn, nameColumn, statusColumn } from './user-columns';
import { UserListView } from './UserListView';

import type { StaffApi } from '../api/staff.api';
import type { ManagedUserKind, UserListColumn } from '../types/admin-users.types';
import type { ReactNode } from 'react';

export interface StaffListPageProps<T extends StaffAccount> {
  kind: ManagedUserKind;
  title: string;
  /** Yaratish tugmasi va oyna sarlavhasi uchun birlik nomi ("mentor", "admin"). */
  singular: string;
  api: StaffApi<T>;
  /** Telefon va holat orasidagi qo'shimcha ustunlar (masalan mentor guruhlari). */
  extraColumns?: readonly UserListColumn<T>[];
  nav?: ReactNode;
}

function StaffRowActions<T extends StaffAccount>({
  kind,
  user,
  api,
}: {
  kind: ManagedUserKind;
  user: T;
  api: StaffApi<T>;
}) {
  return (
    <Stack direction="horizontal" gap="2">
      <StaffEditDialog kind={kind} user={user} update={api.update} />
      <StatusToggleAction kind={kind} user={user} update={api.update} />
      <ResetPasswordAction
        kind={kind}
        userId={user.id}
        userName={personName(user)}
        loginItem={{ term: 'Telefon', value: user.phone }}
        reset={api.resetPassword}
      />
    </Stack>
  );
}

/** Xodimlar (mentorlar, adminlar) ro'yxati: yaratish, tahrirlash, deaktivatsiya, parol tiklash. */
export function StaffListPage<T extends StaffAccount>({
  kind,
  title,
  singular,
  api,
  extraColumns = [],
  nav,
}: StaffListPageProps<T>) {
  const columns: UserListColumn<T>[] = [
    nameColumn(),
    { key: 'phone', header: 'Telefon', render: (user) => user.phone },
    ...extraColumns,
    statusColumn(),
    createdAtColumn(),
    {
      key: 'actions',
      header: 'Amallar',
      render: (user) => <StaffRowActions kind={kind} user={user} api={api} />,
    },
  ];

  return (
    <UserListView
      kind={kind}
      title={title}
      fetchList={api.list}
      columns={columns}
      searchPlaceholder="Ism, familiya yoki telefon"
      nav={nav}
      actions={
        <CreateUserDialog
          kind={kind}
          triggerLabel={`Yangi ${singular}`}
          title={`Yangi ${singular}`}
          schema={staffFormSchema}
          defaultValues={EMPTY_STAFF_FORM}
          fields={STAFF_FIELDS}
          serverFields={STAFF_SERVER_FIELDS}
          create={(values) => api.create({ ...values, password: null })}
          describe={(result, values) => [
            { term: 'Ism-familiya', value: personName(values) },
            { term: 'Telefon (login)', value: result.phone },
          ]}
        />
      }
    />
  );
}
