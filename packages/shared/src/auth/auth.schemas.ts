import { z } from 'zod';

import { PASSWORD_MAX_LENGTH, passwordSchema, phoneSchema } from './credentials.js';

/** `users.student_code` uzunligi (docs/11 §1: varchar(16)). */
export const STUDENT_CODE_MAX_LENGTH = 16;

/**
 * Login paytidagi parol: siyosat (`passwordSchema`) bu yerda tekshirilmaydi — u faqat yangi parol
 * o'rnatilganda qo'llanadi. Uzunlik chegarasi — hash'lashga juda uzun satr yuborilmasligi uchun.
 */
const loginPasswordSchema = z.string().min(1).max(PASSWORD_MAX_LENGTH);

/** `POST /auth/staff/login` (docs/12 §1, docs/02 §4.1). */
export const staffLoginSchema = z.object({
  phone: phoneSchema,
  password: loginPasswordSchema,
});

/** `POST /auth/student/login` (docs/12 §1, docs/02 §4.2). Kod katta harfga keltiriladi: `st-10245` → `ST-10245`. */
export const studentLoginSchema = z.object({
  studentCode: z.string().trim().min(1).max(STUDENT_CODE_MAX_LENGTH).toUpperCase(),
  password: loginPasswordSchema,
});

/** `POST /auth/change-password` (docs/12 §1, docs/02 §4.2). Yangi parol — parol siyosati bo'yicha (S-19). */
export const changePasswordSchema = z.object({
  oldPassword: loginPasswordSchema,
  newPassword: passwordSchema,
});

export type StaffLoginRequest = z.input<typeof staffLoginSchema>;
export type StudentLoginRequest = z.input<typeof studentLoginSchema>;
export type ChangePasswordRequest = z.input<typeof changePasswordSchema>;
