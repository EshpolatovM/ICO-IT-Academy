import type { MentorGroupItem } from '@lms/shared';

import { HeadedTable } from '@/components/shared';
import { TableCell, TableRow, TextLink } from '@/components/ui';
import { formatDateOnly } from '@/lib/format';

import { mentorGroupPath } from '../lib/mentor-panel-paths';

const HEADERS = ['Nom', "Yo'l", 'Studentlar', 'Boshlanish'] as const;

/** Mentor guruhlari: nom (→ tafsilot), yo'l, studentlar soni, boshlanish sanasi. */
export function MentorGroupsTable({ groups }: { groups: readonly MentorGroupItem[] }) {
  return (
    <HeadedTable label="Guruhlar" headers={HEADERS}>
      {groups.map((group) => (
        <TableRow key={group.id}>
          <TableCell>
            <TextLink href={mentorGroupPath(group.id)}>{group.name}</TextLink>
          </TableCell>
          <TableCell>{group.path.title}</TableCell>
          <TableCell>{group.studentsCount}</TableCell>
          <TableCell>{formatDateOnly(group.startsAt)}</TableCell>
        </TableRow>
      ))}
    </HeadedTable>
  );
}
