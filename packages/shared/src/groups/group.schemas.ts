import { z } from 'zod';

import { GroupStatus } from '../enums/group-status.js';
import { offsetPaginationQuerySchema } from '../pagination/offset-pagination.js';
import {
  AT_LEAST_ONE_FIELD_MESSAGE,
  hasAnyField,
  optionalTrimmed,
} from '../validation/schema-helpers.js';

import {
  GROUP_MEMBERS_ADD_MAX,
  GROUP_NAME_MAX_LENGTH,
  GROUP_SEARCH_MAX_LENGTH,
} from './group.constants.js';

/**
 * Guruhlar boshqaruvi sxemalari (docs/12 §2). Hammasi `z.strictObject`: noma'lum maydon — 400.
 * Sana (`startsAt`) — `YYYY-MM-DD` (docs/11 §2: `starts_at date`).
 */

export const DUPLICATE_STUDENT_IDS_MESSAGE = "Studentlar ro'yxatida takrorlangan id bor.";

export const groupNameSchema = z.string().trim().min(1).max(GROUP_NAME_MAX_LENGTH);
export const groupStatusSchema = z.enum(GroupStatus);
const groupStartsAtSchema = z.iso.date().nullish();

/** `POST /admin/groups`. `mentorId` berilsa — faol MENTOR bo'lishi shart. */
export const createGroupSchema = z.strictObject({
  name: groupNameSchema,
  pathId: z.uuid(),
  mentorId: z.uuid().nullish(),
  startsAt: groupStartsAtSchema,
});

/** `PATCH /admin/groups/:id`. Mentor — `PUT /admin/groups/:id/mentor`, a'zolar — `/members`. */
export const updateGroupSchema = z
  .strictObject({
    name: groupNameSchema.optional(),
    status: groupStatusSchema.optional(),
    startsAt: groupStartsAtSchema,
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

/** `PUT /admin/groups/:id/mentor`: `null` — mentorni olib tashlash. */
export const assignGroupMentorSchema = z.strictObject({
  mentorId: z.uuid().nullable(),
});

/** `POST /admin/groups/:id/members`. */
export const addGroupMembersSchema = z.strictObject({
  studentIds: z
    .array(z.uuid())
    .min(1)
    .max(GROUP_MEMBERS_ADD_MAX)
    .refine((ids) => new Set(ids).size === ids.length, DUPLICATE_STUDENT_IDS_MESSAGE),
});

/** `GET /admin/groups`: `q` — guruh nomi bo'yicha qism moslik (katta-kichik harf farqisiz). */
export const groupListQuerySchema = z.strictObject({
  ...offsetPaginationQuerySchema.shape,
  q: optionalTrimmed(GROUP_SEARCH_MAX_LENGTH),
  status: groupStatusSchema.optional(),
  mentorId: z.uuid().optional(),
  pathId: z.uuid().optional(),
});

export type CreateGroupRequest = z.input<typeof createGroupSchema>;
export type UpdateGroupRequest = z.input<typeof updateGroupSchema>;
export type AssignGroupMentorRequest = z.input<typeof assignGroupMentorSchema>;
export type AddGroupMembersRequest = z.input<typeof addGroupMembersSchema>;
export type GroupListQuery = z.input<typeof groupListQuerySchema>;
