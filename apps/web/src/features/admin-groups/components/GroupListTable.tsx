'use client';

import type { AdminGroupListItem } from '@lms/shared';

import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TextLink,
} from '@/components/ui';

import { groupDetailPath } from '../lib/admin-groups-paths';
import { formatDateOnly, personName } from '../lib/format';

import { GroupStatusBadge } from './GroupStatusBadge';

import type { ReactNode } from 'react';

interface GroupColumn {
  key: string;
  header: string;
  render: (group: AdminGroupListItem) => ReactNode;
}

const COLUMNS: readonly GroupColumn[] = [
  {
    key: 'name',
    header: 'Nom',
    render: (group) => <TextLink href={groupDetailPath(group.id)}>{group.name}</TextLink>,
  },
  { key: 'path', header: "Yo'l", render: (group) => group.path.title },
  { key: 'mentor', header: 'Mentor', render: (group) => personName(group.mentor) },
  { key: 'members', header: 'Studentlar', render: (group) => group.membersCount },
  { key: 'status', header: 'Holat', render: (group) => <GroupStatusBadge status={group.status} /> },
  { key: 'startsAt', header: 'Boshlanish', render: (group) => formatDateOnly(group.startsAt) },
];

export interface GroupListTableProps {
  items: readonly AdminGroupListItem[] | undefined;
  isLoading: boolean;
  filtered: boolean;
}

function Rows({ items, isLoading, filtered }: GroupListTableProps) {
  if (items === undefined) {
    return (
      <TableRow>
        <TableCell colSpan={COLUMNS.length}>{isLoading ? <Spinner /> : null}</TableCell>
      </TableRow>
    );
  }
  if (items.length === 0) {
    return (
      <TableEmpty
        colSpan={COLUMNS.length}
        title={filtered ? 'Hech narsa topilmadi' : "Hali guruh yo'q"}
        description={filtered ? "Qidiruv yoki filtrni o'zgartirib ko'ring." : undefined}
      />
    );
  }
  return items.map((group) => (
    <TableRow key={group.id}>
      {COLUMNS.map((column) => (
        <TableCell key={column.key}>{column.render(group)}</TableCell>
      ))}
    </TableRow>
  ));
}

/** Guruhlar jadvali: nom, yo'l, mentor, studentlar soni, holat, boshlanish sanasi. */
export function GroupListTable(props: GroupListTableProps) {
  return (
    <Table scrollLabel="Guruhlar">
      <TableHeader>
        <TableRow>
          {COLUMNS.map(({ key, header }) => (
            <TableHead key={key}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <Rows {...props} />
      </TableBody>
    </Table>
  );
}
