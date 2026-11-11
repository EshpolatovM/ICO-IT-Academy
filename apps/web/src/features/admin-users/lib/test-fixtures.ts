import type { MentorListItem, PaginatedResult, StudentDetail } from '@lms/shared';

/** Testlar uchun namunaviy ma'lumotlar (docs/12 §2.1 javob shakllari). */
export const STUDENT_FIXTURE: StudentDetail = {
  id: 's1',
  studentCode: 'ST-10245',
  firstName: 'Ali',
  lastName: 'Valiyev',
  status: 'ACTIVE',
  mustChangePassword: true,
  lastLoginAt: null,
  createdAt: '2026-11-11T08:00:00.000Z',
  group: null,
};

export const MENTOR_FIXTURE: MentorListItem = {
  id: 'm1',
  phone: '+998901234567',
  firstName: 'Vali',
  lastName: 'Aliyev',
  status: 'ACTIVE',
  mustChangePassword: false,
  lastLoginAt: null,
  createdAt: '2026-11-10T08:00:00.000Z',
  bio: null,
  groups: [
    { id: 'g1', name: 'FE-12' },
    { id: 'g2', name: 'BE-3' },
  ],
};

export function pageOf<T>(items: T[]): PaginatedResult<T> {
  return { items, total: items.length, page: 1, pageSize: 20 };
}
