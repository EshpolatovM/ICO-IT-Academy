import { createParentTokenSchema } from '@lms/shared';

import { createZodDto } from '../../../common/validation/zod-dto.js';

export class CreateParentTokenDto extends createZodDto(createParentTokenSchema) {}
