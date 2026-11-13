import { Body, Controller, Delete, HttpCode, HttpStatus, Patch } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { AdminChestNode } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { UpdateChestDto } from '../dto/content.dto.js';
import { ChestsService } from '../services/chests.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Mukofot sandiqlari (docs/12 §3, 3.2 §2.1 #20) — SA A. */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/chests')
export class AdminChestsController {
  constructor(private readonly chests: ChestsService) {}

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateChestDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminChestNode> {
    return this.chests.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string, @Actor() actor: ActorContext): Promise<void> {
    return this.chests.remove(id, actor);
  }
}
