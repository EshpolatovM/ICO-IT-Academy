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
import type {
  AdminPathDetail,
  AdminPathsResponse,
  AdminPathTree,
  AdminSectionNode,
} from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import {
  AdminPathsQueryDto,
  CreatePathDto,
  CreateSectionDto,
  PublishPathDto,
  ReorderSectionsDto,
  UpdatePathDto,
} from '../dto/content.dto.js';
import { ContentOrderService, OrderLevel } from '../services/content-order.service.js';
import { PathPublishService } from '../services/path-publish.service.js';
import { PathTreeService } from '../services/path-tree.service.js';
import { PathsService } from '../services/paths.service.js';
import { SectionsService } from '../services/sections.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/**
 * Yo'llar (docs/12 §3, 3.2 §2.1 #1–8, #11): yozish — SA A; ro'yxat va daraxt — M ham (faqat o'qish,
 * barcha holatlar; mentor scope kontentga qo'llanmaydi).
 */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/paths')
export class AdminPathsController {
  constructor(
    private readonly paths: PathsService,
    private readonly publisher: PathPublishService,
    private readonly tree: PathTreeService,
    private readonly sections: SectionsService,
    private readonly order: ContentOrderService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR)
  list(@Query() query: AdminPathsQueryDto): Promise<AdminPathsResponse> {
    return this.paths.list(query);
  }

  @Post()
  create(@Body() body: CreatePathDto, @Actor() actor: ActorContext): Promise<AdminPathDetail> {
    return this.paths.create(body, actor);
  }

  @Get(':id')
  get(@UuidParam('id') id: string): Promise<AdminPathDetail> {
    return this.paths.get(id);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdatePathDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminPathDetail> {
    return this.paths.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string, @Actor() actor: ActorContext): Promise<void> {
    return this.paths.remove(id, actor);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(
    @UuidParam('id') id: string,
    @Body() body: PublishPathDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminPathDetail> {
    return this.publisher.publish(id, body.cascade, actor);
  }

  @Get(':id/tree')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR)
  getTree(@UuidParam('id') id: string): Promise<AdminPathTree> {
    return this.tree.tree(id);
  }

  @Post(':id/sections')
  createSection(
    @UuidParam('id') id: string,
    @Body() body: CreateSectionDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminSectionNode> {
    return this.sections.create(id, body, actor);
  }

  @Put(':id/sections/order')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderSections(
    @UuidParam('id') id: string,
    @Body() body: ReorderSectionsDto,
    @Actor() actor: ActorContext,
  ): Promise<void> {
    return this.order.reorder(OrderLevel.SECTIONS, id, body.sectionIds, actor);
  }
}
