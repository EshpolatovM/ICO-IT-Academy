import type {
  MentorGroupItem,
  MentorGroupsResponse,
  MentorGroupStudentsResponse,
} from '@lms/shared';

import { apiRequest, itemPath } from '@/lib/api';

const BASE_PATH = '/mentor/groups';

/** Mentorning o'z ACTIVE guruhlari (docs/12 §12): M. Boshqa guruh — 404. */
export const mentorGroupsApi = {
  list: () => apiRequest<MentorGroupsResponse>(BASE_PATH),

  get: (id: string) => apiRequest<MentorGroupItem>(itemPath(BASE_PATH, id)),

  students: (id: string) =>
    apiRequest<MentorGroupStudentsResponse>(`${itemPath(BASE_PATH, id)}/students`),
};
