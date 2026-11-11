import { z } from 'zod';

import { PASSWORD_MAX_LENGTH, passwordSchema, phoneSchema } from './credentials.js';

/** `users.student_code` uzunligi (docs/11 §1: varchar(16)). */
export const STUDENT_CODE_MAX_LENGTH = 16;

/**
 * Login paytidagi parol: siyosat (`passwordSchema`) bu yerda tekshirilmaydi — u faqat yangi parol
 * o'rnatilganda qo'llanadi. Uzunlik chegarasi — hash'lashga juda uzun satr yuborilmasligi uchun.
 */
const loginPasswordSchema = z.string().min(1).max(PASSWORD_MAX_LENGTH);

/**
 * Auth so'rov sxemalari `z.strictObject`: noma'lum maydon — 400 `VALIDATION_ERROR` (jimgina tashlab
 * yuborilmaydi).
 */

/** `POST /auth/staff/login` (docs/12 §1, docs/02 §4.1). */
export const staffLoginSchema = z.strictObject({
  phone: phoneSchema,
  password: loginPasswordSchema,
});

/** `POST /auth/student/login` (docs/12 §1, docs/02 §4.2). Kod katta harfga keltiriladi: `st-10245` → `ST-10245`. */
export const studentLoginSchema = z.strictObject({
  studentCode: z.string().trim().min(1).max(STUDENT_CODE_MAX_LENGTH).toUpperCase(),
  password: loginPasswordSchema,
});

/** `POST /auth/change-password` (docs/12 §1, docs/02 §4.2). Yangi parol — parol siyosati bo'yicha (S-19). */
export const changePasswordSchema = z.strictObject({
  oldPassword: loginPasswordSchema,
  newPassword: passwordSchema,
});

export const PASSWORD_MISMATCH_MESSAGE = 'Parollar bir xil emas.';

/**
 * Parolni almashtirish FORMASI (docs/02 §4.2: "yangi parol x2"): API sxemasi + tasdiqlash maydoni.
 * Serverga faqat `oldPassword` va `newPassword` yuboriladi.
 */
export const changePasswordFormSchema = changePasswordSchema
  .extend({ confirmPassword: z.string() })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: PASSWORD_MISMATCH_MESSAGE,
    path: ['confirmPassword'],
  });

export type StaffLoginRequest = z.input<typeof staffLoginSchema>;
export type StudentLoginRequest = z.input<typeof studentLoginSchema>;
export type ChangePasswordRequest = z.input<typeof changePasswordSchema>;
export type ChangePasswordFormValues = z.input<typeof changePasswordFormSchema>;
