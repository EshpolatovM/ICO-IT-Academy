'use client';

import type { ManagedUserBase, UserSort } from '@lms/shared';

import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

import { nextSort, sortDirectionFor } from '../lib/sort';

import type { UserListColumn } from '../types/admin-users.types';

export interface UserListTableProps<T extends ManagedUserBase> {
  label: string;
  columns: readonly UserListColumn<T>[];
  items: readonly T[] | undefined;
  isLoading: boolean;
  sort: UserSort;
  onSortChange: (sort: UserSort) => void;
  emptyTitle: string;
  emptyDescription?: string;
}

function TableBodyRows<T extends ManagedUserBase>({
  columns,
  items,
  isLoading,
  emptyTitle,
  emptyDescription,
}: Omit<UserListTableProps<T>, 'label' | 'sort' | 'onSortChange'>) {
  if (items === undefined) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length}>{isLoading ? <Spinner /> : null}</TableCell>
      </TableRow>
    );
  }
  if (items.length === 0) {
    return (
      <TableEmpty colSpan={columns.length} title={emptyTitle} description={emptyDescription} />
    );
  }
  return items.map((item) => (
    <TableRow key={item.id}>
      {columns.map((column) => (
        <TableCell key={column.key}>{column.render(item)}</TableCell>
      ))}
    </TableRow>
  ));
}

/** Foydalanuvchilar jadvali: ustunlar konfiguratsiyadan, saralanadigan sarlavhalar. */
export function UserListTable<T extends ManagedUserBase>({
  label,
  sort,
  onSortChange,
  ...body
}: UserListTableProps<T>) {
  return (
    <Table scrollLabel={label}>
      <TableHeader>
        <TableRow>
          {body.columns.map(({ key, header, sortField }) =>
            sortField === undefined ? (
              <TableHead key={key}>{header}</TableHead>
            ) : (
              <TableHead
                key={key}
                sortDirection={sortDirectionFor(sort, sortField)}
                onSort={() => {
                  onSortChange(nextSort(sort, sortField));
                }}
              >
                {header}
              </TableHead>
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableBodyRows {...body} />
      </TableBody>
    </Table>
  );
}
