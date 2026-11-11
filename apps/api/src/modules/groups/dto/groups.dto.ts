import {
  addGroupMembersSchema,
  assignGroupMentorSchema,
  createGroupSchema,
  groupListQuerySchema,
  updateGroupSchema,
} from '@lms/shared';

import { createZodDto } from '../../../common/validation/zod-dto.js';

/** DTO'lar `@lms/shared` sxemalaridan (docs/12 §2). */
export class CreateGroupDto extends createZodDto(createGroupSchema) {}
export class UpdateGroupDto extends createZodDto(updateGroupSchema) {}
export class GroupListQueryDto extends createZodDto(groupListQuerySchema) {}
export class AssignGroupMentorDto extends createZodDto(assignGroupMentorSchema) {}
export class AddGroupMembersDto extends createZodDto(addGroupMembersSchema) {}
