import {
  changePasswordSchema,
  parentExchangeSchema,
  staffLoginSchema,
  studentLoginSchema,
} from '@lms/shared';

import { createZodDto } from '../../../common/validation/zod-dto.js';

export class StaffLoginDto extends createZodDto(staffLoginSchema) {}

export class StudentLoginDto extends createZodDto(studentLoginSchema) {}

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}

export class ParentExchangeDto extends createZodDto(parentExchangeSchema) {}
