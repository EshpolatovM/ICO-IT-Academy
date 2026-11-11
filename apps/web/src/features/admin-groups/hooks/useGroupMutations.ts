'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  AddGroupMembersRequest,
  AdminGroupDetail,
  AssignGroupMentorRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
} from '@lms/shared';

import { adminUsersKeys } from '@/lib/query';

import { adminGroupsKeys } from '../api/admin-groups.query-keys';
import { groupsApi } from '../api/groups.api';

/** Studentlar ro'yxati va tafsilotidagi "Guruh" ma'lumoti (admin-users keshi). */
const STUDENTS_KEY = adminUsersKeys.kind('students');

/**
 * Guruh tafsilotini qaytaradigan mutatsiya: javob keshga, ro'yxatlar qayta yuklanadi.
 * `affectsStudents` — a'zolik, nom yoki holat o'zgarsa studentlar keshi ham eskiradi.
 */
function useGroupDetailMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<AdminGroupDetail>,
  affectsStudents = false,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (group) => {
      queryClient.setQueryData(adminGroupsKeys.detail(group.id), group);
      void queryClient.invalidateQueries({ queryKey: adminGroupsKeys.lists() });
      if (affectsStudents) void queryClient.invalidateQueries({ queryKey: STUDENTS_KEY });
    },
  });
}

/** `POST /admin/groups`. */
export function useCreateGroup() {
  return useGroupDetailMutation((body: CreateGroupRequest) => groupsApi.create(body));
}

/** `PATCH /admin/groups/:id` (nom, sana, holat — arxivlash/faollashtirish). */
export function useUpdateGroup(id: string) {
  return useGroupDetailMutation((body: UpdateGroupRequest) => groupsApi.update(id, body), true);
}

/** `PUT /admin/groups/:id/mentor` (`null` — olib tashlash). */
export function useAssignGroupMentor(id: string) {
  return useGroupDetailMutation((body: AssignGroupMentorRequest) =>
    groupsApi.assignMentor(id, body),
  );
}

/** `POST /admin/groups/:id/members`. */
export function useAddGroupMembers(id: string) {
  return useGroupDetailMutation(
    (body: AddGroupMembersRequest) => groupsApi.addMembers(id, body),
    true,
  );
}

/** `DELETE /admin/groups/:id/members/:studentId` (204): tafsilot va ro'yxatlar qayta yuklanadi. */
export function useRemoveGroupMember(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => groupsApi.removeMember(id, studentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminGroupsKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: adminGroupsKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
      ]);
    },
  });
}
