import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { CreatedStaffResponse, MentorDetail, PaginatedResult } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { NoStore } from '../../../common/decorators/no-store.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { CreateStaffDto, StaffListQueryDto, UpdateStaffDto } from '../dto/admin-users.dto.js';
import { MentorAccountsService } from '../services/mentor-accounts.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Mentorlar — super admin va admin (docs/12 §2, docs/01 §2.1, S-07 A). */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/mentors')
export class AdminMentorsController {
  constructor(private readonly mentors: MentorAccountsService) {}

  @Get()
  list(@Query() query: StaffListQueryDto): Promise<PaginatedResult<MentorDetail>> {
    return this.mentors.list(query);
  }

  @Post()
  @NoStore()
  create(
    @Body() body: CreateStaffDto,
    @Actor() actor: ActorContext,
  ): Promise<CreatedStaffResponse> {
    return this.mentors.create(body, actor);
  }

  @Get(':id')
  get(@UuidParam('id') id: string): Promise<MentorDetail> {
    return this.mentors.get(id);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateStaffDto,
    @Actor() actor: ActorContext,
  ): Promise<MentorDetail> {
    return this.mentors.update(id, body, actor);
  }
}
