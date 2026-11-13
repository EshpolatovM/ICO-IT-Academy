import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { Role } from '@lms/shared';
import type { SkillItem, SkillsResponse } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { CreateSkillDto, SkillsQueryDto, UpdateSkillDto } from '../dto/content.dto.js';
import { SkillsService } from '../services/skills.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Ko'nikmalar (docs/12 §3, 3.2 §2.1 #21, #22) — SA A. */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/skills')
export class AdminSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  list(@Query() query: SkillsQueryDto): Promise<SkillsResponse> {
    return this.skills.list(query);
  }

  @Post()
  create(@Body() body: CreateSkillDto, @Actor() actor: ActorContext): Promise<SkillItem> {
    return this.skills.create(body, actor);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateSkillDto,
    @Actor() actor: ActorContext,
  ): Promise<SkillItem> {
    return this.skills.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string, @Actor() actor: ActorContext): Promise<void> {
    return this.skills.remove(id, actor);
  }
}
