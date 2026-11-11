import type {
  AccessTokenResponse,
  ChangePasswordRequest,
  LoginResponse,
  MeResponse,
  StaffLoginRequest,
  StudentLoginRequest,
} from '@lms/shared';

import { apiRequest } from '@/lib/api';

/** Auth endpointlari (docs/12 §1). Login — public: Bearer yuborilmaydi, 401 da refresh qilinmaydi. */
export const authApi = {
  staffLogin: (body: StaffLoginRequest) =>
    apiRequest<LoginResponse>('/auth/staff/login', { method: 'POST', body, auth: false }),

  studentLogin: (body: StudentLoginRequest) =>
    apiRequest<LoginResponse>('/auth/student/login', { method: 'POST', body, auth: false }),

  changePassword: (body: ChangePasswordRequest) =>
    apiRequest<AccessTokenResponse>('/auth/change-password', { method: 'POST', body }),

  me: () => apiRequest<MeResponse>('/auth/me'),

  logout: () => apiRequest<undefined>('/auth/logout', { method: 'POST' }),
};
