import { Controller, Get } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { LearningPathsResponse } from '@lms/shared';

import { Roles } from '../../../common/decorators/roles.decorator.js';
import { LearningPathsService } from '../services/learning-paths.service.js';

/**
 * Yo'llar ro'yxati — guruh formasi uchun (docs/12 §2.2, §3: SA A; GET: M ham — faqat o'qish, M4
 * qarori). Yozish endpointlari va to'liq kontent CRUD — 3-bosqichda.
 */
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR)
@Controller('admin/paths')
export class AdminPathsController {
  constructor(private readonly paths: LearningPathsService) {}

  @Get()
  list(): Promise<LearningPathsResponse> {
    return this.paths.list();
  }
}
