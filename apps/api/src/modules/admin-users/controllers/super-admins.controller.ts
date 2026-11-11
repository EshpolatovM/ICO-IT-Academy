import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { AdminUserListItem, CreatedStaffResponse, PaginatedResult } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { NoStore } from '../../../common/decorators/no-store.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { CreateStaffDto, StaffListQueryDto, UpdateStaffDto } from '../dto/admin-users.dto.js';
import { AdminAccountsService } from '../services/admin-accounts.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Adminlar — faqat super admin (docs/12 §2, docs/01 §2.1, S-11 A). */
@Roles(Role.SUPER_ADMIN)
@Controller('super/admins')
export class SuperAdminsController {
  constructor(private readonly admins: AdminAccountsService) {}

  @Get()
  list(@Query() query: StaffListQueryDto): Promise<PaginatedResult<AdminUserListItem>> {
    return this.admins.list(query);
  }

  @Post()
  @NoStore()
  create(
    @Body() body: CreateStaffDto,
    @Actor() actor: ActorContext,
  ): Promise<CreatedStaffResponse> {
    return this.admins.create(body, actor);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateStaffDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminUserListItem> {
    return this.admins.update(id, body, actor);
  }
}
