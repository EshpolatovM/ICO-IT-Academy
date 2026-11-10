import type { AccountRole, Role } from '@lms/shared';

import type { Request } from 'express';

/** Akkauntli foydalanuvchi (SA, A, M, S) — `Authorization: Bearer <access>`. */
export interface AccountRequestUser {
  id: string;
  role: AccountRole;
  mustChangePassword: boolean;
}

/**
 * Ota-ona sessiyasi (`ps` cookie, docs/02 §3, docs/10 §3). Akkaunt yo'q: `id` — sessiyaning
 * birinchi tokeni id'si (JWT `sub`). `tokenIds` va `studentIds` — faqat hozir ham amalda bo'lgan
 * tokenlar va ularga bog'langan farzandlar (har so'rovda tekshiriladi).
 */
export interface ParentRequestUser {
  id: string;
  role: typeof Role.PARENT;
  mustChangePassword: false;
  tokenIds: readonly string[];
  studentIds: readonly string[];
}

/** Autentifikatsiyadan o'tgan so'rov egasi (`JwtAuthGuard` → `request.user`). */
export type RequestUser = AccountRequestUser | ParentRequestUser;

/** So'rov yuborgan mijoz haqida (sessiyalar ro'yxati va rate limit uchun). */
export interface ClientMeta {
  ip: string | null;
  userAgent: string | null;
}

/** Amalni bajargan foydalanuvchi va uning mijozi (audit va rate limit uchun). */
export interface ActorContext {
  user: RequestUser;
  meta: ClientMeta;
}

export interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}
