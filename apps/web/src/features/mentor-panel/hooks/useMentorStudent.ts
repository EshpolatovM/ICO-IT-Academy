'use client';

import { useQuery } from '@tanstack/react-query';

import { mentorPanelKeys } from '../api/mentor-panel.query-keys';
import { mentorStudentsApi } from '../api/mentor-students.api';

/** `GET /mentor/students/:id` (student mentorning faol guruhida bo'lmasa — 404). */
export function useMentorStudent(id: string) {
  return useQuery({
    queryKey: mentorPanelKeys.student(id),
    queryFn: () => mentorStudentsApi.get(id),
  });
}
