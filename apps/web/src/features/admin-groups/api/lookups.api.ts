import { GroupStatus, UserStatus } from '@lms/shared';
import type {
  AdminGroupListItem,
  MentorListItem,
  PaginatedResult,
  StudentListItem,
} from '@lms/shared';

import { apiRequest, itemPath, withQuery } from '@/lib/api';

import { groupsApi } from './groups.api';

const MENTORS_PATH = '/admin/mentors';
const STUDENTS_PATH = '/admin/students';

/**
 * Tanlov ro'yxatlari faqat faol yozuvlardan, qidiruv `q` bilan (docs/12 §2.1–2.2).
 * `sort` yuborilmaydi — har bir ro'yxat o'z standart tartibida.
 */
function activeSearch(status: UserStatus | GroupStatus, q: string): URLSearchParams {
  const search = new URLSearchParams({ status });
  const trimmed = q.trim();
  if (trimmed.length > 0) {
    search.set('q', trimmed);
  }
  return search;
}

/** Combobox'lar uchun mentor, student va guruh qidiruvi (faqat o'qish). */
export const lookupsApi = {
  mentors: (q: string) =>
    apiRequest<PaginatedResult<MentorListItem>>(
      withQuery(MENTORS_PATH, activeSearch(UserStatus.ACTIVE, q)),
    ),

  mentor: (id: string) => apiRequest<MentorListItem>(itemPath(MENTORS_PATH, id)),

  students: (q: string) =>
    apiRequest<PaginatedResult<StudentListItem>>(
      withQuery(STUDENTS_PATH, activeSearch(UserStatus.ACTIVE, q)),
    ),

  /** `GET /admin/groups?q=&status=ACTIVE`. */
  groups: (q: string): Promise<PaginatedResult<AdminGroupListItem>> =>
    groupsApi.list(activeSearch(GroupStatus.ACTIVE, q)),

  /** Filtrdagi tanlangan guruh yorlig'i uchun (`GET /admin/groups/:id`). */
  group: (id: string): Promise<AdminGroupListItem> => groupsApi.get(id),
};
