import { Injectable } from '@nestjs/common';

import { AuditAction, ErrorCode } from '@lms/shared';
import type {
  ParentTokenCreatedResponse,
  ParentTokensListResponse,
  ParentTokenSummary,
} from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';
import { ParentAccessTokensRepository } from '../repositories/parent-access-tokens.repository.js';

import { ParentTokenAuditor, parentTokenAuditView } from './parent-token-auditor.service.js';
import { ParentTokenIssuer } from './parent-token-issuer.service.js';
import { ParentTokenValidityCache } from './parent-token-validity.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { CreateParentTokenDto } from '../dto/parent-tokens.dto.js';
import type { ParentTokenRecord } from '../parent-access.types.js';

function toSummary(record: ParentTokenRecord): ParentTokenSummary {
  return {
    id: record.id,
    prefix: record.tokenPrefix,
    label: record.label,
    createdAt: record.createdAt.toISOString(),
    lastUsedAt: record.lastUsedAt?.toISOString() ?? null,
    useCount: record.useCount,
    expiresAt: record.expiresAt?.toISOString() ?? null,
  };
}

/**
 * Ota-ona tokenlarini boshqarish (docs/02 §4.4, §5, §7): ro'yxat, yaratish (limit, S-17),
 * bekor qilish va qayta yaratish. Xom token faqat yaratish javobida bir marta qaytadi.
 * Scope (kim qaysi studentga) — controller'dagi `@StudentScope`; bu yerda student mavjudligi.
 */
@Injectable()
export class ParentTokensService {
  constructor(
    private readonly tokens: ParentAccessTokensRepository,
    private readonly users: UsersRepository,
    private readonly issuer: ParentTokenIssuer,
    private readonly validity: ParentTokenValidityCache,
    private readonly auditor: ParentTokenAuditor,
  ) {}

  async list(studentId: string): Promise<ParentTokensListResponse> {
    await this.assertStudentExists(studentId);
    const records = await this.tokens.listActive(studentId, new Date());
    return { items: records.map(toSummary) };
  }

  async create(
    studentId: string,
    dto: CreateParentTokenDto,
    actor: ActorContext,
  ): Promise<ParentTokenCreatedResponse> {
    await this.assertStudentExists(studentId);
    const generated = this.issuer.generate();
    const limit = this.issuer.maxActiveTokens;
    const record = await this.tokens.createWithinLimit(
      {
        studentId,
        tokenHash: generated.tokenHash,
        tokenPrefix: generated.tokenPrefix,
        label: dto.label ?? null,
        createdById: actor.user.id,
      },
      limit,
      new Date(),
    );
    if (!record) {
      throw new AppException({
        code: ErrorCode.CONFLICT,
        message: `Bitta studentda ${limit} tadan ortiq faol ota-ona tokeni bo'lishi mumkin emas`,
        details: { limit },
      });
    }
    await this.auditor.record(actor, AuditAction.PARENT_TOKEN_CREATED, record.id, {
      after: parentTokenAuditView(record),
    });
    return this.issuer.toCreatedResponse(record, generated.token);
  }

  async revoke(studentId: string, tokenId: string, actor: ActorContext): Promise<void> {
    const revoked = await this.tokens.revoke({
      tokenId,
      studentId,
      revokedById: actor.user.id,
      at: new Date(),
    });
    if (!revoked) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
    await this.validity.invalidate(tokenId);
    await this.auditor.record(actor, AuditAction.PARENT_TOKEN_REVOKED, tokenId, {
      before: parentTokenAuditView(revoked),
    });
  }

  async regenerate(
    studentId: string,
    tokenId: string,
    actor: ActorContext,
  ): Promise<ParentTokenCreatedResponse> {
    const generated = this.issuer.generate();
    const result = await this.tokens.regenerate(
      { tokenId, studentId, revokedById: actor.user.id, at: new Date() },
      {
        studentId,
        tokenHash: generated.tokenHash,
        tokenPrefix: generated.tokenPrefix,
        createdById: actor.user.id,
      },
    );
    if (!result) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
    await this.validity.invalidate(tokenId);
    await this.auditor.record(actor, AuditAction.PARENT_TOKEN_REGENERATED, result.created.id, {
      before: { ...parentTokenAuditView(result.revoked), tokenId },
      after: parentTokenAuditView(result.created),
    });
    return this.issuer.toCreatedResponse(result.created, generated.token);
  }

  private async assertStudentExists(studentId: string): Promise<void> {
    if (!(await this.users.findStudent(studentId))) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
  }
}
