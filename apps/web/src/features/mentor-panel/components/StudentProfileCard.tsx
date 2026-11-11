import type { MentorStudentProfile } from '@lms/shared';

import { ResetPasswordAction, studentIdentityItems } from '@/components/shared';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DescriptionList,
  Stack,
  TextLink,
} from '@/components/ui';
import { formatDateTime, personName } from '@/lib/format';

import { mentorPanelKeys } from '../api/mentor-panel.query-keys';
import { mentorStudentsApi } from '../api/mentor-students.api';
import { mentorGroupPath } from '../lib/mentor-panel-paths';

function groupLink(student: MentorStudentProfile) {
  return student.group === null ? null : (
    <TextLink href={mentorGroupPath(student.group.id)}>{student.group.name}</TextLink>
  );
}

/** Student ma'lumotlari (ID, ism, holat, guruh, oxirgi kirish) va parolni tiklash. */
export function StudentProfileCard({ student }: { student: MentorStudentProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma&apos;lumotlar</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="4">
          <DescriptionList
            items={[
              ...studentIdentityItems(student),
              { term: 'Guruh', value: groupLink(student) },
              { term: 'Oxirgi kirish', value: formatDateTime(student.lastLoginAt) },
              { term: 'Faol ota-ona tokenlari', value: student.parentTokensCount },
            ]}
          />
          <Stack direction="horizontal" gap="2" wrap>
            <ResetPasswordAction
              userId={student.id}
              userName={personName(student)}
              loginItem={{ term: 'Student ID (login)', value: student.studentCode }}
              reset={mentorStudentsApi.resetPassword}
              invalidateKey={mentorPanelKeys.student(student.id)}
              size="md"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
