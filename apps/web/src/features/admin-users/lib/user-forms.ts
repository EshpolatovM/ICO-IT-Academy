import { createStaffSchema, createStudentSchema } from '@lms/shared';

import type { z } from 'zod';

/** Xodim (admin, mentor) formasi: yaratish va tahrirlash (parol — doim tizim yaratadi). */
export const staffFormSchema = createStaffSchema.pick({
  phone: true,
  firstName: true,
  lastName: true,
});

/** Student formasi: ism va familiya (guruh — 2.3 dan keyin). */
export const studentFormSchema = createStudentSchema.pick({ firstName: true, lastName: true });

export type StaffFormInput = z.input<typeof staffFormSchema>;
export type StaffFormValues = z.output<typeof staffFormSchema>;
export type StudentFormInput = z.input<typeof studentFormSchema>;
export type StudentFormValues = z.output<typeof studentFormSchema>;

/** Server maydon nomlari forma maydonlari bilan bir xil. */
export const STAFF_SERVER_FIELDS = {
  phone: 'phone',
  firstName: 'firstName',
  lastName: 'lastName',
} as const;

export const STUDENT_SERVER_FIELDS = { firstName: 'firstName', lastName: 'lastName' } as const;

export const EMPTY_STAFF_FORM: StaffFormInput = { phone: '', firstName: '', lastName: '' };
export const EMPTY_STUDENT_FORM: StudentFormInput = { firstName: '', lastName: '' };
