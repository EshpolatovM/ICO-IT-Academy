import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Role } from '@lms/shared';
import type { AdminGroupDetail, AdminGroupListItem, PaginatedResult } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import {
  AddGroupMembersDto,
  AssignGroupMentorDto,
  CreateGroupDto,
  GroupListQueryDto,
  UpdateGroupDto,
} from '../dto/groups.dto.js';
import { AdminGroupsService } from '../services/admin-groups.service.js';
import { GroupMembersService } from '../services/group-members.service.js';
import { GroupMentorService } from '../services/group-mentor.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Guruhlar boshqaruvi — super admin va admin (docs/12 §2, docs/01 §2.1). */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/groups')
export class AdminGroupsController {
  constructor(
    private readonly groups: AdminGroupsService,
    private readonly mentors: GroupMentorService,
    private readonly members: GroupMembersService,
  ) {}

  @Get()
  list(@Query() query: GroupListQueryDto): Promise<PaginatedResult<AdminGroupListItem>> {
    return this.groups.list(query);
  }

  @Post()
  create(@Body() body: CreateGroupDto, @Actor() actor: ActorContext): Promise<AdminGroupDetail> {
    return this.groups.create(body, actor);
  }

  @Get(':id')
  get(@UuidParam('id') id: string): Promise<AdminGroupDetail> {
    return this.groups.get(id);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateGroupDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminGroupDetail> {
    return this.groups.update(id, body, actor);
  }

  @Put(':id/mentor')
  assignMentor(
    @UuidParam('id') id: string,
    @Body() body: AssignGroupMentorDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminGroupDetail> {
    return this.mentors.assign(id, body.mentorId, actor);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.OK)
  addMembers(
    @UuidParam('id') id: string,
    @Body() body: AddGroupMembersDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminGroupDetail> {
    return this.members.add(id, body.studentIds, actor);
  }

  @Delete(':id/members/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @UuidParam('id') id: string,
    @UuidParam('studentId') studentId: string,
    @Actor() actor: ActorContext,
  ): Promise<void> {
    return this.members.remove(id, studentId, actor);
  }
}
