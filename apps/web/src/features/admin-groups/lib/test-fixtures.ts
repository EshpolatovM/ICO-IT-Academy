import type {
  AdminGroupDetail,
  MentorListItem,
  PaginatedResult,
  StudentListItem,
} from '@lms/shared';

/** Testlar uchun namunaviy ma'lumotlar (docs/12 §2.2 javob shakllari). */
export const IDS = {
  group: '0190a000-0000-7000-8000-000000000001',
  path: '0190a000-0000-7000-8000-000000000002',
  mentor: '0190a000-0000-7000-8000-000000000003',
  student: '0190a000-0000-7000-8000-000000000004',
  student2: '0190a000-0000-7000-8000-000000000005',
} as const;

export const GROUP_FIXTURE: AdminGroupDetail = {
  id: IDS.group,
  name: 'FE-12',
  status: 'ACTIVE',
  startsAt: '2026-12-01',
  createdAt: '2026-11-11T08:00:00.000Z',
  path: { id: IDS.path, title: 'Frontend dasturchi' },
  mentor: { id: IDS.mentor, firstName: 'Bobur', lastName: 'Karimov' },
  membersCount: 1,
  members: [
    {
      id: IDS.student,
      studentCode: 'ST-10245',
      firstName: 'Ali',
      lastName: 'Valiyev',
      status: 'ACTIVE',
      joinedAt: '2026-11-11T08:00:00.000Z',
    },
  ],
};

export const MENTOR_FIXTURE: MentorListItem = {
  id: IDS.mentor,
  phone: '+998901234567',
  firstName: 'Bobur',
  lastName: 'Karimov',
  status: 'ACTIVE',
  mustChangePassword: false,
  lastLoginAt: null,
  createdAt: '2026-11-10T08:00:00.000Z',
  bio: null,
  groups: [],
};

export const STUDENT_FIXTURE: StudentListItem = {
  id: IDS.student2,
  studentCode: 'ST-10246',
  firstName: 'Laylo',
  lastName: 'Karimova',
  status: 'ACTIVE',
  mustChangePassword: true,
  lastLoginAt: null,
  createdAt: '2026-11-11T08:00:00.000Z',
  group: { id: '0190a000-0000-7000-8000-000000000009', name: 'BE-3' },
};

export const PATHS_FIXTURE = {
  items: [{ id: IDS.path, title: 'Frontend dasturchi', slug: 'frontend', status: 'PUBLISHED' }],
};

export function pageOf<T>(items: T[]): PaginatedResult<T> {
  return { items, total: items.length, page: 1, pageSize: 20 };
}
