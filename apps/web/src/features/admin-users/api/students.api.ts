import { STUDENT_IMPORT_FILE_FIELD } from '@lms/shared';
import type {
  CreatedStudentResponse,
  CreateStudentRequest,
  PaginatedResult,
  PasswordResetResponse,
  StudentDetail,
  StudentImportResult,
  StudentListItem,
  UpdateStudentRequest,
} from '@lms/shared';

import { apiRequest, itemPath, withQuery } from '@/lib/api';

const BASE_PATH = '/admin/students';

/** Studentlarni boshqarish (docs/12 §2.1): SA, A. */
export const studentsApi = {
  list: (query: URLSearchParams) =>
    apiRequest<PaginatedResult<StudentListItem>>(withQuery(BASE_PATH, query)),

  get: (id: string) => apiRequest<StudentDetail>(itemPath(BASE_PATH, id)),

  create: (body: CreateStudentRequest) =>
    apiRequest<CreatedStudentResponse>(BASE_PATH, { method: 'POST', body }),

  update: (id: string, body: UpdateStudentRequest) =>
    apiRequest<StudentDetail>(itemPath(BASE_PATH, id), { method: 'PATCH', body }),

  /** CSV import: `multipart/form-data`, fayl maydoni `STUDENT_IMPORT_FILE_FIELD`. */
  import: (file: File) => {
    const body = new FormData();
    body.append(STUDENT_IMPORT_FILE_FIELD, file);
    return apiRequest<StudentImportResult>(`${BASE_PATH}/import`, { method: 'POST', body });
  },

  resetPassword: (id: string) =>
    apiRequest<PasswordResetResponse>(`${itemPath('/students', id)}/reset-password`, {
      method: 'POST',
    }),
};
