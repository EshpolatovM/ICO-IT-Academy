import type {
  AdminUserListItem,
  CreatedStaffResponse,
  CreateStaffRequest,
  MentorListItem,
  PaginatedResult,
  PasswordResetResponse,
  StaffAccount,
  UpdateStaffRequest,
} from '@lms/shared';

import { apiRequest, itemPath, withQuery } from '@/lib/api';

export interface StaffApi<T extends StaffAccount> {
  list: (query: URLSearchParams) => Promise<PaginatedResult<T>>;
  create: (body: CreateStaffRequest) => Promise<CreatedStaffResponse>;
  update: (id: string, body: UpdateStaffRequest) => Promise<T>;
  resetPassword: (id: string) => Promise<PasswordResetResponse>;
}

/** Xodimlar (admin, mentor) endpointlari bir xil shaklda — faqat bosh yo'l farq qiladi. */
function createStaffApi<T extends StaffAccount>(basePath: string): StaffApi<T> {
  return {
    list: (query) => apiRequest<PaginatedResult<T>>(withQuery(basePath, query)),
    create: (body) => apiRequest<CreatedStaffResponse>(basePath, { method: 'POST', body }),
    update: (id, body) => apiRequest<T>(itemPath(basePath, id), { method: 'PATCH', body }),
    resetPassword: (id) =>
      apiRequest<PasswordResetResponse>(`${itemPath('/staff', id)}/reset-password`, {
        method: 'POST',
      }),
  };
}

/** `GET/POST /admin/mentors`, `PATCH /admin/mentors/:id` — SA, A. */
export const mentorsApi = createStaffApi<MentorListItem>('/admin/mentors');

/** `GET/POST /super/admins`, `PATCH /super/admins/:id` — faqat SA. */
export const adminsApi = createStaffApi<AdminUserListItem>('/super/admins');
