'use client';

import Link from 'next/link';

import type { StudentListItem } from '@lms/shared';

import { Button, TextLink } from '@/components/ui';

import { studentsApi } from '../api/students.api';
import { AdminUsersPath, studentDetailPath } from '../lib/admin-users-paths';
import { fullName } from '../lib/format';
import { STUDENT_FIELDS } from '../lib/user-fields';
import { EMPTY_STUDENT_FORM, STUDENT_SERVER_FIELDS, studentFormSchema } from '../lib/user-forms';

import { CreateUserDialog } from './CreateUserDialog';
import { GroupFilterPlaceholder } from './GroupFilterPlaceholder';
import { createdAtColumn, nameColumn, statusColumn } from './user-columns';
import { UserListView } from './UserListView';
import { UsersSectionNav } from './UsersSectionNav';

import type { UserListColumn } from '../types/admin-users.types';

const COLUMNS: readonly UserListColumn<StudentListItem>[] = [
  {
    key: 'studentCode',
    header: 'ID',
    render: (student) => (
      <TextLink href={studentDetailPath(student.id)}>{student.studentCode}</TextLink>
    ),
  },
  nameColumn((student) => (
    <TextLink href={studentDetailPath(student.id)}>{fullName(student)}</TextLink>
  )),
  // Guruh boshqaruvi — 2.3; hozir API qaytargan faol guruh nomi ko'rsatiladi.
  { key: 'group', header: 'Guruh', render: (student) => student.group?.name ?? '—' },
  statusColumn(),
  createdAtColumn(),
];

function CreateStudentDialog() {
  return (
    <CreateUserDialog
      kind="students"
      triggerLabel="Yangi student"
      title="Yangi student"
      schema={studentFormSchema}
      defaultValues={EMPTY_STUDENT_FORM}
      fields={STUDENT_FIELDS}
      serverFields={STUDENT_SERVER_FIELDS}
      create={(values) => studentsApi.create({ ...values, groupId: null, password: null })}
      describe={(result, values) => [
        { term: 'Ism-familiya', value: fullName(values) },
        { term: 'Student ID (login)', value: result.studentCode },
      ]}
    />
  );
}

/** `/admin/students` (SA, A) — docs/03 §4. */
export function StudentsPage() {
  return (
    <UserListView
      kind="students"
      title="Studentlar"
      fetchList={studentsApi.list}
      columns={COLUMNS}
      searchPlaceholder="Student ID (ST-10245) yoki ism"
      nav={<UsersSectionNav />}
      extraFilters={<GroupFilterPlaceholder />}
      actions={
        <>
          <Button asChild variant="secondary">
            <Link href={AdminUsersPath.STUDENT_IMPORT}>CSV import</Link>
          </Button>
          <CreateStudentDialog />
        </>
      }
    />
  );
}
