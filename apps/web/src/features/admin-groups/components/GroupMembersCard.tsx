'use client';

import type { AdminGroupDetail } from '@lms/shared';

import { UserStatusBadge } from '@/components/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TextLink,
} from '@/components/ui';
import { formatDate, personName } from '@/lib/format';

import { studentDetailHref } from '../lib/admin-groups-paths';

import { AddMembersForm } from './AddMembersForm';
import { RemoveMemberAction } from './RemoveMemberAction';

const HEADERS = ['ID', 'Ism-familiya', 'Holat', "Qo'shilgan", ''] as const;

function MemberRows({ group }: { group: AdminGroupDetail }) {
  if (group.members.length === 0) {
    return <TableEmpty colSpan={HEADERS.length} title="Guruhda hali student yo'q" />;
  }
  return group.members.map((member) => (
    <TableRow key={member.id}>
      <TableCell>
        <TextLink href={studentDetailHref(member.id)}>{member.studentCode}</TextLink>
      </TableCell>
      <TableCell>{personName(member)}</TableCell>
      <TableCell>
        <UserStatusBadge status={member.status} />
      </TableCell>
      <TableCell>{formatDate(member.joinedAt)}</TableCell>
      <TableCell>
        <RemoveMemberAction groupId={group.id} groupName={group.name} member={member} />
      </TableCell>
    </TableRow>
  ));
}

/** A'zolar: qo'shish formasi va jadval (ID, ism, holat, qo'shilgan sana, chiqarish). */
export function GroupMembersCard({ group }: { group: AdminGroupDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>A&apos;zolar ({group.membersCount})</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="4">
          <AddMembersForm group={group} />
          <Table scrollLabel="A'zolar">
            <TableHeader>
              <TableRow>
                {HEADERS.map((header) => (
                  <TableHead key={header === '' ? 'actions' : header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <MemberRows group={group} />
            </TableBody>
          </Table>
        </Stack>
      </CardContent>
    </Card>
  );
}
