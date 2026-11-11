import {
  createStaffSchema,
  createStudentSchema,
  staffListQuerySchema,
  studentListQuerySchema,
  updateStaffSchema,
  updateStudentSchema,
} from '@lms/shared';

import { createZodDto } from '../../../common/validation/zod-dto.js';

/** DTO'lar `@lms/shared` sxemalaridan (docs/12 §2). */
export class CreateStaffDto extends createZodDto(createStaffSchema) {}
export class UpdateStaffDto extends createZodDto(updateStaffSchema) {}
export class StaffListQueryDto extends createZodDto(staffListQuerySchema) {}
export class CreateStudentDto extends createZodDto(createStudentSchema) {}
export class UpdateStudentDto extends createZodDto(updateStudentSchema) {}
export class StudentListQueryDto extends createZodDto(studentListQuerySchema) {}
