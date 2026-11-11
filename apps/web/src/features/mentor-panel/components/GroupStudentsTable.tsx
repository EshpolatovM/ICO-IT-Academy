import type { MentorGroupStudent } from '@lms/shared';

import { HeadedTable, UserStatusBadge } from '@/components/shared';
import { TableCell, TableEmpty, TableRow, TextLink } from '@/components/ui';
import { formatDateTime, personName } from '@/lib/format';

import { mentorStudentPath } from '../lib/mentor-panel-paths';

/** Progress, XP, streak, davomat — keyingi bosqichlarda (docs/12 §12), hozir ustun yo'q. */
const HEADERS = ['ID', 'Ism-familiya', 'Holat', 'Oxirgi kirish'] as const;

function StudentRows({ students }: { students: readonly MentorGroupStudent[] }) {
  if (students.length === 0) {
    return <TableEmpty colSpan={HEADERS.length} title="Guruhda hali student yo'q" />;
  }
  return students.map((student) => (
    <TableRow key={student.id}>
      <TableCell>
        <TextLink href={mentorStudentPath(student.id)}>{student.studentCode}</TextLink>
      </TableCell>
      <TableCell>{personName(student)}</TableCell>
      <TableCell>
        <UserStatusBadge status={student.status} />
      </TableCell>
      <TableCell>{formatDateTime(student.lastLoginAt)}</TableCell>
    </TableRow>
  ));
}

/** Guruh studentlari: ID (→ profil), ism, holat, oxirgi kirish. */
export function GroupStudentsTable({ students }: { students: readonly MentorGroupStudent[] }) {
  return (
    <HeadedTable label="Studentlar" headers={HEADERS}>
      <StudentRows students={students} />
    </HeadedTable>
  );
}
