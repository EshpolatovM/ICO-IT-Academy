import type { ParentTokenSummary } from '@lms/shared';

/** Token qatoridagi amallar (qayta yaratish, bekor qilish) uchun umumiy props. */
export interface ParentTokenActionProps {
  studentId: string;
  studentName: string;
  token: ParentTokenSummary;
}
