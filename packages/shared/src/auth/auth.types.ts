import type { Role } from '../enums/role.js';
import type { ParentMeResponse } from '../parent/parent.types.js';

/**
 * Akkauntli rollar (docs/01 §1). PARENT — virtual rol, akkaunti yo'q: u alohida parent session
 * bilan kiradi (docs/02 §3, 1.6-vazifa), shuning uchun bu ro'yxatga kirmaydi.
 */
export type AccountRole = Exclude<Role, 'PARENT'>;

/** Login va `GET /auth/me` javobidagi foydalanuvchi (docs/12 §1). */
export interface AuthUser {
  id: string;
  role: AccountRole;
  firstName: string;
  lastName: string;
  /** Faqat staff (telefon + parol bilan kiruvchi) uchun. */
  phone?: string;
  /** Faqat student uchun (`ST-10245`). */
  studentCode?: string;
  mustChangePassword: boolean;
}

/** Yangi access token (`/auth/refresh`, `/auth/change-password`). `expiresIn` — soniyalarda. */
export interface AccessTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/** `POST /auth/staff/login`, `POST /auth/student/login` — 200 (refresh token `rt` cookie'da). */
export interface LoginResponse extends AccessTokenResponse {
  user: AuthUser;
}

/** Faol sessiya (qurilma) — `refresh_tokens` asosida (docs/02 §6). `id` — rotation zanjiri (oila) id'si. */
export interface AuthSession {
  id: string;
  userAgent: string | null;
  ip: string | null;
  /** Shu sessiyada oxirgi marta token yangilangan (yoki kirilgan) vaqt, ISO-8601. */
  lastActiveAt: string;
  expiresAt: string;
  /** So'rov yuborgan qurilmaning o'z sessiyasi. */
  current: boolean;
}

/** `GET /auth/sessions` — 200. */
export interface AuthSessionsResponse {
  items: AuthSession[];
}

/** `GET /auth/me` (docs/12 §1: "ANY + P") — akkauntli foydalanuvchi yoki ota-ona sessiyasi (`role` bo'yicha ajratiladi). */
export type MeResponse = AuthUser | ParentMeResponse;
