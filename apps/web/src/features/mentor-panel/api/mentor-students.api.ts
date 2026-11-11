import type { MentorStudentProfile, PasswordResetResponse } from '@lms/shared';

import { apiRequest, itemPath } from '@/lib/api';

/** Student profili (docs/12 §12) va parolni tiklash (docs/12 §2.1): `@StudentScope`, aks holda 404. */
export const mentorStudentsApi = {
  get: (id: string) => apiRequest<MentorStudentProfile>(itemPath('/mentor/students', id)),

  resetPassword: (id: string) =>
    apiRequest<PasswordResetResponse>(`${itemPath('/students', id)}/reset-password`, {
      method: 'POST',
    }),
};
