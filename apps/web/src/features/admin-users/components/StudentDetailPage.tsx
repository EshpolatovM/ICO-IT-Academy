'use client';

import { ErrorCode } from '@lms/shared';
import type { StudentDetail } from '@lms/shared';

import { QueryErrorAlert, UserStatusBadge } from '@/components/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DescriptionList,
  EmptyState,
  PageHeader,
  Spinner,
  Stack,
  TextLink,
} from '@/components/ui';
import { isApiError } from '@/lib/api';
import { formatDateTime, personName } from '@/lib/format';

import { studentsApi } from '../api/students.api';
import { useStudent } from '../hooks/useStudent';
import { AdminUsersPath } from '../lib/admin-users-paths';

import { ResetPasswordAction } from './ResetPasswordAction';
import { StatusToggleAction } from './StatusToggleAction';
import { StudentEditCard } from './StudentEditCard';

function StudentInfoCard({ student }: { student: StudentDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma&apos;lumotlar</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList
          items={[
            { term: 'Student ID', value: student.studentCode },
            { term: 'Ism-familiya', value: personName(student) },
            { term: 'Holat', value: <UserStatusBadge status={student.status} /> },
            { term: 'Guruh', value: student.group?.name },
            {
              term: 'Vaqtinchalik parol',
              value: student.mustChangePassword ? 'Ha (hali almashtirmagan)' : "Yo'q",
            },
            { term: 'Oxirgi kirish', value: formatDateTime(student.lastLoginAt) },
            { term: 'Yaratilgan', value: formatDateTime(student.createdAt) },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function StudentActionsCard({ student }: { student: StudentDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Amallar</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack direction="horizontal" gap="2" wrap>
          <ResetPasswordAction
            kind="students"
            userId={student.id}
            userName={personName(student)}
            loginItem={{ term: 'Student ID (login)', value: student.studentCode }}
            reset={studentsApi.resetPassword}
            size="md"
          />
          <StatusToggleAction
            kind="students"
            user={student}
            update={studentsApi.update}
            size="md"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function StudentDetailContent({ id }: { id: string }) {
  const query = useStudent(id);
  if (query.isPending) {
    return <Spinner />;
  }
  if (query.isError) {
    return isApiError(query.error) && query.error.code === ErrorCode.NOT_FOUND ? (
      <EmptyState title="Student topilmadi" description="U o'chirilgan yoki havola noto'g'ri." />
    ) : (
      <QueryErrorAlert error={query.error} onRetry={() => void query.refetch()} />
    );
  }
  const student = query.data;
  return (
    <Stack gap="6">
      <PageHeader
        title={personName(student)}
        titleAddon={<UserStatusBadge status={student.status} />}
      />
      <StudentInfoCard student={student} />
      <StudentEditCard student={student} />
      <StudentActionsCard student={student} />
    </Stack>
  );
}

/** `/admin/students/[id]` — tafsilot, tahrirlash, deaktivatsiya, parolni tiklash. */
export function StudentDetailPage({ id }: { id: string }) {
  return (
    <Stack gap="4">
      <TextLink href={AdminUsersPath.STUDENTS} variant="muted">
        ← Studentlar
      </TextLink>
      <StudentDetailContent id={id} />
    </Stack>
  );
}
