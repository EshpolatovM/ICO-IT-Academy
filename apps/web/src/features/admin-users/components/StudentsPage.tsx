'use client';

import Link from 'next/link';

import type { CreatedStudentResponse, StudentListItem } from '@lms/shared';

import { Button, TextLink } from '@/components/ui';
import { adminGroupsKeys } from '@/features/admin-groups';
import { personName } from '@/lib/format';

import { studentsApi } from '../api/students.api';
import { AdminUsersPath, studentDetailPath } from '../lib/admin-users-paths';
import { STUDENT_FIELDS } from '../lib/user-fields';
import {
  CREATE_STUDENT_SERVER_FIELDS,
  createStudentFormSchema,
  EMPTY_CREATE_STUDENT_FORM,
} from '../lib/user-forms';

import { CreateUserDialog } from './CreateUserDialog';
import { StudentGroupField } from './StudentGroupField';
import { StudentGroupFilter } from './StudentGroupFilter';
import { createdAtColumn, nameColumn, statusColumn } from './user-columns';
import { UserListView } from './UserListView';
import { UsersSectionNav } from './UsersSectionNav';

import type { CreateStudentFormInput, CreateStudentFormValues } from '../lib/user-forms';
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
    <TextLink href={studentDetailPath(student.id)}>{personName(student)}</TextLink>
  )),
  { key: 'group', header: 'Guruh', render: (student) => student.group?.name ?? '—' },
  statusColumn(),
  createdAtColumn(),
];

/** Guruh bilan yaratilganda guruhning a'zolari soni o'zgaradi — admin-groups keshi yangilanadi. */
const GROUP_KEYS = [adminGroupsKeys.all] as const;

function CreateStudentDialog() {
  return (
    <CreateUserDialog<CreateStudentFormInput, CreateStudentFormValues, CreatedStudentResponse>
      kind="students"
      triggerLabel="Yangi student"
      title="Yangi student"
      schema={createStudentFormSchema}
      defaultValues={EMPTY_CREATE_STUDENT_FORM}
      fields={STUDENT_FIELDS}
      serverFields={CREATE_STUDENT_SERVER_FIELDS}
      renderExtraFields={(form) => <StudentGroupField form={form} />}
      invalidateAlso={GROUP_KEYS}
      create={(values) => studentsApi.create({ ...values, password: null })}
      describe={(result, values) => [
        { term: 'Ism-familiya', value: personName(values) },
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
      extraFilters={<StudentGroupFilter />}
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
