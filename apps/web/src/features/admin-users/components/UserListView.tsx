'use client';

import type { ManagedUserBase } from '@lms/shared';

import { PageHeader, Pagination, Stack } from '@/components/ui';

import { useListUrlState } from '../hooks/useListUrlState';
import { useUserList } from '../hooks/useUserList';

import { QueryErrorAlert } from './QueryErrorAlert';
import { UserListTable } from './UserListTable';
import { UserListToolbar } from './UserListToolbar';

import type { ManagedUserKind, UserListColumn, UserListFetcher } from '../types/admin-users.types';
import type { ReactNode } from 'react';

export interface UserListViewProps<T extends ManagedUserBase> {
  kind: ManagedUserKind;
  title: string;
  fetchList: UserListFetcher<T>;
  columns: readonly UserListColumn<T>[];
  searchPlaceholder: string;
  /** Sarlavha yonidagi amallar (yaratish, import). */
  actions?: ReactNode;
  /** Sarlavha ostidagi bo'limlar navigatsiyasi. */
  nav?: ReactNode;
  extraFilters?: ReactNode;
}

/**
 * Foydalanuvchilar ro'yxati sahifasi (studentlar, mentorlar, adminlar uchun umumiy): qidiruv,
 * holat filtri, saralash, pagination — hammasi URL query'da; yuklanish, bo'sh va xato holatlari.
 */
export function UserListView<T extends ManagedUserBase>({
  kind,
  title,
  fetchList,
  columns,
  searchPlaceholder,
  actions,
  nav,
  extraFilters,
}: UserListViewProps<T>) {
  const { state, setPage, setQuery, setStatus, setSort } = useListUrlState();
  const list = useUserList(kind, fetchList, state);
  const filtered = state.q !== '' || state.status !== undefined || state.groupId !== undefined;

  return (
    <Stack gap="6">
      <PageHeader title={title} actions={actions} />
      {nav}
      <UserListToolbar
        q={state.q}
        onSearch={setQuery}
        searchPlaceholder={searchPlaceholder}
        status={state.status}
        onStatusChange={setStatus}
        extraFilters={extraFilters}
      />
      {list.isError ? (
        <QueryErrorAlert error={list.error} onRetry={() => void list.refetch()} />
      ) : null}
      <UserListTable
        label={title}
        columns={columns}
        items={list.data?.items}
        isLoading={list.isPending}
        sort={state.sort}
        onSortChange={setSort}
        emptyTitle={filtered ? 'Hech narsa topilmadi' : "Hali hech kim yo'q"}
        emptyDescription={filtered ? "Qidiruv yoki filtrni o'zgartirib ko'ring." : undefined}
      />
      {list.data !== undefined && list.data.total > 0 ? (
        <Pagination
          page={list.data.page}
          pageSize={list.data.pageSize}
          total={list.data.total}
          onPageChange={setPage}
        />
      ) : null}
    </Stack>
  );
}
