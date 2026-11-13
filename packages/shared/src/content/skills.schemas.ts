import { z } from 'zod';

import { offsetPaginationQuerySchema } from '../pagination/offset-pagination.js';
import {
  AT_LEAST_ONE_FIELD_MESSAGE,
  hasAnyField,
  optionalTrimmed,
} from '../validation/schema-helpers.js';

import {
  contentTitleSchema,
  optionalTextSchema,
  uniqueIdsSchema,
} from './content-schema-helpers.js';
import {
  CONTENT_ICON_MAX_LENGTH,
  SKILL_NAME_MAX_LENGTH,
  SKILL_SEARCH_MAX_LENGTH,
  TOPIC_SKILLS_MAX,
} from './content.constants.js';

/** Ko'nikmalar (docs/12 §3, 3.2 §2.2). */

const skillNameSchema = contentTitleSchema(SKILL_NAME_MAX_LENGTH);
const skillIconSchema = optionalTextSchema(CONTENT_ICON_MAX_LENGTH);

export const createSkillSchema = z.strictObject({
  name: skillNameSchema,
  icon: skillIconSchema.optional(),
});

export const updateSkillSchema = z
  .strictObject({
    name: skillNameSchema.optional(),
    icon: skillIconSchema.nullish(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

/** `GET /admin/skills`: `q` — nom bo'yicha qism moslik, tartib `name asc`. */
export const skillsQuerySchema = z.strictObject({
  ...offsetPaginationQuerySchema.shape,
  q: optionalTrimmed(SKILL_SEARCH_MAX_LENGTH),
});

/** `PUT /admin/topics/:id/skills`: to'plamni almashtirish; bo'sh — hammasini olib tashlash. */
export const setTopicSkillsSchema = z.strictObject({
  skillIds: uniqueIdsSchema(0, TOPIC_SKILLS_MAX),
});

export type CreateSkillRequest = z.input<typeof createSkillSchema>;
export type UpdateSkillRequest = z.input<typeof updateSkillSchema>;
export type SkillsQuery = z.input<typeof skillsQuerySchema>;
export type SetTopicSkillsRequest = z.input<typeof setTopicSkillsSchema>;
