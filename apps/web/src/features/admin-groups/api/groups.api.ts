import type {
  AddGroupMembersRequest,
  AdminGroupDetail,
  AdminGroupListItem,
  AssignGroupMentorRequest,
  CreateGroupRequest,
  LearningPathsResponse,
  PaginatedResult,
  UpdateGroupRequest,
} from '@lms/shared';

import { apiRequest, itemPath, withQuery } from '@/lib/api';

const GROUPS_PATH = '/admin/groups';

/** Guruhlar boshqaruvi (docs/12 §2.2): SA, A. Mutatsiyalar javobi — guruh tafsiloti. */
export const groupsApi = {
  list: (search: URLSearchParams) =>
    apiRequest<PaginatedResult<AdminGroupListItem>>(withQuery(GROUPS_PATH, search)),

  get: (id: string) => apiRequest<AdminGroupDetail>(itemPath(GROUPS_PATH, id)),

  create: (body: CreateGroupRequest) =>
    apiRequest<AdminGroupDetail>(GROUPS_PATH, { method: 'POST', body }),

  update: (id: string, body: UpdateGroupRequest) =>
    apiRequest<AdminGroupDetail>(itemPath(GROUPS_PATH, id), { method: 'PATCH', body }),

  assignMentor: (id: string, body: AssignGroupMentorRequest) =>
    apiRequest<AdminGroupDetail>(`${itemPath(GROUPS_PATH, id)}/mentor`, { method: 'PUT', body }),

  addMembers: (id: string, body: AddGroupMembersRequest) =>
    apiRequest<AdminGroupDetail>(`${itemPath(GROUPS_PATH, id)}/members`, {
      method: 'POST',
      body,
    }),

  /** 204 — javob body'siz. */
  removeMember: (id: string, studentId: string) =>
    apiRequest<undefined>(itemPath(`${itemPath(GROUPS_PATH, id)}/members`, studentId), {
      method: 'DELETE',
    }),
};

/** `GET /admin/paths` — guruh formasi va filtri uchun yo'llar ro'yxati. */
export const pathsApi = {
  list: () => apiRequest<LearningPathsResponse>('/admin/paths'),
};
