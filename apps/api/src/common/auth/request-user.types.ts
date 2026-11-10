import type { Role } from '@lms/shared';

import type { Request } from 'express';

/**
 * Autentifikatsiyadan o'tgan so'rov egasi (`JwtAuthGuard` → `request.user`).
 * `role` — `Role` (PARENT ham): parent session (1.6) ham shu shaklga keltiriladi.
 */
export interface RequestUser {
  id: string;
  role: Role;
  mustChangePassword: boolean;
}

/** So'rov yuborgan mijoz haqida (sessiyalar ro'yxati va rate limit uchun). */
export interface ClientMeta {
  ip: string | null;
  userAgent: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}
