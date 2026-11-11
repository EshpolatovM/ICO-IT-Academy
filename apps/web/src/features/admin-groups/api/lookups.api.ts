import { UserStatus } from '@lms/shared';
import type { MentorListItem, PaginatedResult, StudentListItem } from '@lms/shared';

import { apiRequest, itemPath, withQuery } from '@/lib/api';

const MENTORS_PATH = '/admin/mentors';
const STUDENTS_PATH = '/admin/students';

/** Tanlov ro'yxatlari faqat faol akkauntlardan, qidiruv `q` bilan (docs/12 §2.1). */
function activeSearch(q: string): URLSearchParams {
  const search = new URLSearchParams({ status: UserStatus.ACTIVE });
  const trimmed = q.trim();
  if (trimmed.length > 0) {
    search.set('q', trimmed);
  }
  return search;
}

/** Combobox'lar uchun mentor va student qidiruvi (faqat o'qish). */
export const lookupsApi = {
  mentors: (q: string) =>
    apiRequest<PaginatedResult<MentorListItem>>(withQuery(MENTORS_PATH, activeSearch(q))),

  mentor: (id: string) => apiRequest<MentorListItem>(itemPath(MENTORS_PATH, id)),

  students: (q: string) =>
    apiRequest<PaginatedResult<StudentListItem>>(withQuery(STUDENTS_PATH, activeSearch(q))),
};
