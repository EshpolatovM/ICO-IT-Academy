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

import { apiRequest } from '@/lib/api';

import { idSegment, withQuery } from './request-path';

const BASE_PATH = '/admin/students';

/** Studentlarni boshqarish (docs/12 §2.1): SA, A. */
export const studentsApi = {
  list: (query: URLSearchParams) =>
    apiRequest<PaginatedResult<StudentListItem>>(withQuery(BASE_PATH, query)),

  get: (id: string) => apiRequest<StudentDetail>(`${BASE_PATH}/${idSegment(id)}`),

  create: (body: CreateStudentRequest) =>
    apiRequest<CreatedStudentResponse>(BASE_PATH, { method: 'POST', body }),

  update: (id: string, body: UpdateStudentRequest) =>
    apiRequest<StudentDetail>(`${BASE_PATH}/${idSegment(id)}`, { method: 'PATCH', body }),

  /** CSV import: `multipart/form-data`, fayl maydoni `STUDENT_IMPORT_FILE_FIELD`. */
  import: (file: File) => {
    const body = new FormData();
    body.append(STUDENT_IMPORT_FILE_FIELD, file);
    return apiRequest<StudentImportResult>(`${BASE_PATH}/import`, { method: 'POST', body });
  },

  resetPassword: (id: string) =>
    apiRequest<PasswordResetResponse>(`/students/${idSegment(id)}/reset-password`, {
      method: 'POST',
    }),
};
