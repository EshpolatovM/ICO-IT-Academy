import { z } from 'zod';

import { createGroupSchema, groupNameSchema } from '@lms/shared';
import type { AdminGroupDetail } from '@lms/shared';

/**
 * Sana maydoni (`DateInput`) qiymati — `YYYY-MM-DD`; bo'sh satr — "sanasiz" (`null`).
 * Qolgan qoida — `@lms/shared` dagi `createGroupSchema.startsAt` (bir joyda).
 */
const startsAtFieldSchema = z.union([
  z.literal('').transform(() => null),
  createGroupSchema.shape.startsAt,
]);

/** "Yangi guruh" formasi: `createGroupSchema` + bo'sh sana → `null`. */
export const createGroupFormSchema = createGroupSchema.extend({ startsAt: startsAtFieldSchema });

/**
 * Tahrirlash formasi (nom, sana). `updateGroupSchema` refine'li bo'lgani uchun kengaytirilmaydi —
 * maydonlar o'sha umumiy sxemalardan; API'ga ikkala maydon yuboriladi (o'zgarmagani — no-op).
 */
export const editGroupFormSchema = z.strictObject({
  name: groupNameSchema,
  startsAt: startsAtFieldSchema,
});

export type CreateGroupFormInput = z.input<typeof createGroupFormSchema>;
export type CreateGroupFormValues = z.output<typeof createGroupFormSchema>;
export type EditGroupFormInput = z.input<typeof editGroupFormSchema>;
export type EditGroupFormValues = z.output<typeof editGroupFormSchema>;

export const EMPTY_CREATE_GROUP_FORM: CreateGroupFormInput = {
  name: '',
  pathId: '',
  mentorId: null,
  startsAt: '',
};

/** Server maydon nomlari forma maydonlari bilan bir xil (docs/12 §2.2 `details[].field`). */
export const CREATE_GROUP_SERVER_FIELDS = {
  name: 'name',
  pathId: 'pathId',
  mentorId: 'mentorId',
  startsAt: 'startsAt',
} as const;

export const EDIT_GROUP_SERVER_FIELDS = { name: 'name', startsAt: 'startsAt' } as const;

export function editGroupDefaults(group: AdminGroupDetail): EditGroupFormInput {
  return { name: group.name, startsAt: group.startsAt ?? '' };
}
