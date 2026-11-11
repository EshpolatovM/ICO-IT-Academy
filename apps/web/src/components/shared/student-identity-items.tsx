import type { UserStatus } from '@lms/shared';

import type { DescriptionItem } from '@/components/ui';
import { personName } from '@/lib/format';

import { UserStatusBadge } from './UserStatusBadge';

interface StudentIdentity {
  studentCode: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
}

/** Student tafsilotining boshidagi qatorlar: Student ID, ism-familiya, holat. */
export function studentIdentityItems(student: StudentIdentity): DescriptionItem[] {
  return [
    { term: 'Student ID', value: student.studentCode },
    { term: 'Ism-familiya', value: personName(student) },
    { term: 'Holat', value: <UserStatusBadge status={student.status} /> },
  ];
}
