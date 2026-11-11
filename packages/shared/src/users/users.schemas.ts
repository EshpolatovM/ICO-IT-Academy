import { z } from 'zod';

import { passwordSchema, phoneSchema } from '../auth/credentials.js';
import { UserStatus } from '../enums/user-status.js';
import { GROUP_NAME_MAX_LENGTH } from '../groups/group.constants.js';
import { offsetPaginationQuerySchema } from '../pagination/offset-pagination.js';
import {
  AT_LEAST_ONE_FIELD_MESSAGE,
  hasAnyField,
  optionalTrimmed,
} from '../validation/schema-helpers.js';

import {
  PERSON_NAME_MAX_LENGTH,
  USER_SEARCH_MAX_LENGTH,
  USER_SORT_DEFAULT,
  UserSort,
} from './users.constants.js';

/**
 * Foydalanuvchilarni boshqarish sxemalari (docs/12 §2). Hammasi `z.strictObject`: noma'lum
 * maydon — 400 `VALIDATION_ERROR`.
 */

export const personNameSchema = z.string().trim().min(1).max(PERSON_NAME_MAX_LENGTH);

export const userStatusSchema = z.enum(UserStatus);

/** Boshlang'ich parol: berilmasa (`null`/yo'q) — tizim vaqtinchalik parol yaratadi (S-18). */
const initialPasswordSchema = passwordSchema.nullish();

/** `POST /super/admins`, `POST /admin/mentors`. */
export const createStaffSchema = z.strictObject({
  phone: phoneSchema,
  firstName: personNameSchema,
  lastName: personNameSchema,
  password: initialPasswordSchema,
});

/** `PATCH /super/admins/:id`, `PATCH /admin/mentors/:id`. */
export const updateStaffSchema = z
  .strictObject({
    phone: phoneSchema.optional(),
    firstName: personNameSchema.optional(),
    lastName: personNameSchema.optional(),
    status: userStatusSchema.optional(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

/** `POST /admin/students`. `groupId` berilsa — student shu (faol) guruhga a'zo qilinadi. */
export const createStudentSchema = z.strictObject({
  firstName: personNameSchema,
  lastName: personNameSchema,
  groupId: z.uuid().nullish(),
  password: initialPasswordSchema,
});

/** `PATCH /admin/students/:id`. Guruhga qo'shish/chiqarish — `/admin/groups/:id/members` (2.3). */
export const updateStudentSchema = z
  .strictObject({
    firstName: personNameSchema.optional(),
    lastName: personNameSchema.optional(),
    status: userStatusSchema.optional(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

const userListShape = {
  ...offsetPaginationQuerySchema.shape,
  q: optionalTrimmed(USER_SEARCH_MAX_LENGTH),
  status: userStatusSchema.optional(),
  sort: z.enum(UserSort).default(USER_SORT_DEFAULT),
};

/** `GET /super/admins`, `GET /admin/mentors`: `q` — ism/familiya yoki telefon. */
export const staffListQuerySchema = z.strictObject(userListShape);

/** `GET /admin/students`: `q` — student ID (`ST-10245` yoki `10245`) yoki ism/familiya. */
export const studentListQuerySchema = z.strictObject({
  ...userListShape,
  groupId: z.uuid().optional(),
});

/** CSV importning bitta qatori (sarlavhadan keyin). */
export const studentImportRowSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  groupName: optionalTrimmed(GROUP_NAME_MAX_LENGTH),
});

export type CreateStaffRequest = z.input<typeof createStaffSchema>;
export type UpdateStaffRequest = z.input<typeof updateStaffSchema>;
export type CreateStudentRequest = z.input<typeof createStudentSchema>;
export type UpdateStudentRequest = z.input<typeof updateStudentSchema>;
export type StaffListQuery = z.input<typeof staffListQuerySchema>;
export type StudentListQuery = z.input<typeof studentListQuerySchema>;
export type StudentImportRow = z.output<typeof studentImportRowSchema>;
