import type { MentorStudentProfile } from '@lms/shared';

import { apiRequest, itemPath } from '@/lib/api';

/** Student profili (docs/12 §12): `@StudentScope`, aks holda 404. Parolni tiklash — `@/lib/api`. */
export const mentorStudentsApi = {
  get: (id: string) => apiRequest<MentorStudentProfile>(itemPath('/mentor/students', id)),
};
