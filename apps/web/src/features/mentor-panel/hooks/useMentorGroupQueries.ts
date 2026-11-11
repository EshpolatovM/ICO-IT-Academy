'use client';

import { useQuery } from '@tanstack/react-query';

import { mentorGroupsApi } from '../api/mentor-groups.api';
import { mentorPanelKeys } from '../api/mentor-panel.query-keys';

/** `GET /mentor/groups` — o'z ACTIVE guruhlari. */
export function useMentorGroups() {
  return useQuery({
    queryKey: mentorPanelKeys.groups(),
    queryFn: mentorGroupsApi.list,
    select: (data) => data.items,
  });
}

/** `GET /mentor/groups/:id` (o'ziniki bo'lmasa — 404). */
export function useMentorGroup(id: string) {
  return useQuery({
    queryKey: mentorPanelKeys.group(id),
    queryFn: () => mentorGroupsApi.get(id),
  });
}

/** `GET /mentor/groups/:id/students` (tartib — familiya). */
export function useMentorGroupStudents(id: string) {
  return useQuery({
    queryKey: mentorPanelKeys.groupStudents(id),
    queryFn: () => mentorGroupsApi.students(id),
    select: (data) => data.items,
  });
}
