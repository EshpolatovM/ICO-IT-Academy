'use client';

import { useQuery } from '@tanstack/react-query';

import { adminUsersKeys } from '@/lib/query';

import { studentsApi } from '../api/students.api';

/** `GET /admin/students/:id`. */
export function useStudent(id: string) {
  return useQuery({
    queryKey: adminUsersKeys.detail('students', id),
    queryFn: () => studentsApi.get(id),
  });
}
