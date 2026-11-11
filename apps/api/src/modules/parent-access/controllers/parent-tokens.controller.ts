import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import type { ParentTokenCreatedResponse, ParentTokensListResponse } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { NoStore } from '../../../common/decorators/no-store.decorator.js';
import { StaffStudentAccess } from '../../../common/decorators/staff-student-access.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { CreateParentTokenDto } from '../dto/parent-tokens.dto.js';
import { ParentTokensService } from '../services/parent-tokens.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/**
 * Ota-ona tokenlari (docs/12 §2: SA A M; docs/02 §7). Mentor — `@StudentScope` orqali
 * (faqat o'z guruhi studenti, aks holda 404).
 */
@StaffStudentAccess('id')
@Controller('students/:id/parent-tokens')
export class ParentTokensController {
  constructor(private readonly parentTokens: ParentTokensService) {}

  @Get()
  list(@UuidParam('id') studentId: string): Promise<ParentTokensListResponse> {
    return this.parentTokens.list(studentId);
  }

  /** Xom token va havola faqat shu javobda (keshlanmaydi). */
  @Post()
  @NoStore()
  create(
    @UuidParam('id') studentId: string,
    @Body() dto: CreateParentTokenDto,
    @Actor() actor: ActorContext,
  ): Promise<ParentTokenCreatedResponse> {
    return this.parentTokens.create(studentId, dto, actor);
  }

  @Delete(':tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  revoke(
    @UuidParam('id') studentId: string,
    @UuidParam('tokenId') tokenId: string,
    @Actor() actor: ActorContext,
  ): Promise<void> {
    return this.parentTokens.revoke(studentId, tokenId, actor);
  }

  /** Revoke + create bitta tranzaksiyada (docs/02 §5); yangi xom token faqat shu javobda. */
  @Post(':tokenId/regenerate')
  @NoStore()
  regenerate(
    @UuidParam('id') studentId: string,
    @UuidParam('tokenId') tokenId: string,
    @Actor() actor: ActorContext,
  ): Promise<ParentTokenCreatedResponse> {
    return this.parentTokens.regenerate(studentId, tokenId, actor);
  }
}
