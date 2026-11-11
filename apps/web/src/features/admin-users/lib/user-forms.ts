import { createStaffSchema, createStudentSchema } from '@lms/shared';

import type { z } from 'zod';

/** Xodim (admin, mentor) formasi: yaratish va tahrirlash (parol — doim tizim yaratadi). */
export const staffFormSchema = createStaffSchema.pick({
  phone: true,
  firstName: true,
  lastName: true,
});

/** Student tahrirlash formasi: ism va familiya (guruh — `/admin/groups/:id/members` orqali). */
export const studentFormSchema = createStudentSchema.pick({ firstName: true, lastName: true });

/** "Yangi student" formasi: ism, familiya va ixtiyoriy faol guruh (`groupId`). */
export const createStudentFormSchema = createStudentSchema.pick({
  firstName: true,
  lastName: true,
  groupId: true,
});

export type StaffFormInput = z.input<typeof staffFormSchema>;
export type StaffFormValues = z.output<typeof staffFormSchema>;
export type StudentFormInput = z.input<typeof studentFormSchema>;
export type StudentFormValues = z.output<typeof studentFormSchema>;
export type CreateStudentFormInput = z.input<typeof createStudentFormSchema>;
export type CreateStudentFormValues = z.output<typeof createStudentFormSchema>;

/** Server maydon nomlari forma maydonlari bilan bir xil. */
export const STAFF_SERVER_FIELDS = {
  phone: 'phone',
  firstName: 'firstName',
  lastName: 'lastName',
} as const;

export const STUDENT_SERVER_FIELDS = { firstName: 'firstName', lastName: 'lastName' } as const;

/** 400 `details: [{ field: "groupId" }]` — guruh faol emas (docs/12 §2.1). */
export const CREATE_STUDENT_SERVER_FIELDS = {
  ...STUDENT_SERVER_FIELDS,
  groupId: 'groupId',
} as const;

export const EMPTY_STAFF_FORM: StaffFormInput = { phone: '', firstName: '', lastName: '' };
export const EMPTY_CREATE_STUDENT_FORM: CreateStudentFormInput = {
  firstName: '',
  lastName: '',
  groupId: null,
};
