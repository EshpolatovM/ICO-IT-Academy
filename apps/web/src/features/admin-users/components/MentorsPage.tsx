'use client';

import type { MentorListItem } from '@lms/shared';

import { mentorsApi } from '../api/staff.api';

import { StaffListPage } from './StaffListPage';
import { UsersSectionNav } from './UsersSectionNav';

import type { UserListColumn } from '../types/admin-users.types';

/** Mentorning faol guruhlari (guruhlar boshqaruvi — 2.3). */
const GROUPS_COLUMN: UserListColumn<MentorListItem> = {
  key: 'groups',
  header: 'Guruhlari',
  render: (mentor) =>
    mentor.groups.length > 0 ? mentor.groups.map((group) => group.name).join(', ') : '—',
};

/** `/admin/mentors` (SA, A) — docs/03 §4. */
export function MentorsPage() {
  return (
    <StaffListPage
      kind="mentors"
      title="Mentorlar"
      singular="mentor"
      api={mentorsApi}
      extraColumns={[GROUPS_COLUMN]}
      nav={<UsersSectionNav />}
    />
  );
}
