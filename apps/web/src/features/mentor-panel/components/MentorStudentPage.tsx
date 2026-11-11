'use client';

import type { MentorStudentProfile } from '@lms/shared';

import { QueryView, UserStatusBadge } from '@/components/shared';
import { PageHeader, Stack } from '@/components/ui';
import type { PageHeaderBackLink } from '@/components/ui';
import { personName } from '@/lib/format';

import { useMentorStudent } from '../hooks/useMentorStudent';
import { MentorPanelPath, mentorGroupPath } from '../lib/mentor-panel-paths';

import { ParentTokensCard } from './ParentTokensCard';
import { StudentProfileCard } from './StudentProfileCard';

const GROUPS_LINK: PageHeaderBackLink = { href: MentorPanelPath.GROUPS, label: 'Guruhlar' };

/** "Orqaga" — studentning guruhi (bo'lsa), aks holda guruhlar ro'yxati. */
function backLink(student: MentorStudentProfile): PageHeaderBackLink {
  return student.group === null
    ? GROUPS_LINK
    : { href: mentorGroupPath(student.group.id), label: student.group.name };
}

function StudentContent({ student }: { student: MentorStudentProfile }) {
  const name = personName(student);
  return (
    <Stack gap="6">
      <PageHeader
        back={backLink(student)}
        title={name}
        titleAddon={<UserStatusBadge status={student.status} />}
      />
      <StudentProfileCard student={student} />
      <ParentTokensCard studentId={student.id} studentName={name} />
    </Stack>
  );
}

/** `/mentor/students/[id]` — ma'lumotlar, parolni tiklash, ota-ona tokenlari (docs/03 §3). */
export function MentorStudentPage({ id }: { id: string }) {
  return (
    <QueryView query={useMentorStudent(id)} back={GROUPS_LINK} notFoundTitle="Student topilmadi">
      {(student) => <StudentContent student={student} />}
    </QueryView>
  );
}
