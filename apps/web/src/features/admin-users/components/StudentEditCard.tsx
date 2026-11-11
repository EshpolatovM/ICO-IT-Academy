'use client';

import type { StudentDetail } from '@lms/shared';

import { Alert, Card, CardContent, CardHeader, CardTitle, Stack } from '@/components/ui';

import { studentsApi } from '../api/students.api';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { changedFields } from '../lib/changed-fields';
import { STUDENT_FIELDS } from '../lib/user-fields';
import { STUDENT_SERVER_FIELDS, studentFormSchema } from '../lib/user-forms';

import { UserForm } from './UserForm';

/** Student ism-familiyasini tahrirlash (`PATCH /admin/students/:id`) — faqat o'zgargan maydonlar. */
export function StudentEditCard({ student }: { student: StudentDetail }) {
  const mutation = useUpdateUser('students', studentsApi.update);
  const initial = { firstName: student.firstName, lastName: student.lastName };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tahrirlash</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="3">
          <UserForm
            schema={studentFormSchema}
            defaultValues={initial}
            fields={STUDENT_FIELDS}
            serverFields={STUDENT_SERVER_FIELDS}
            submitLabel="Saqlash"
            onValid={async (values) => {
              const body = changedFields(values, initial);
              if (Object.keys(body).length > 0) {
                await mutation.mutateAsync({ id: student.id, body });
              }
            }}
          />
          {mutation.isSuccess ? <Alert variant="success">Saqlandi</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
