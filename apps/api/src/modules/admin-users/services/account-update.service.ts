import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType, UserStatus } from '@lms/shared';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';
import { phoneTakenException } from '../admin-users.errors.js';
import { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

import { AccountStatusService } from './account-status.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { AccountChanges, UserAccountRecord } from '../admin-users.types.js';

const PROFILE_FIELDS = ['firstName', 'lastName', 'phone'] as const;
type ProfileField = (typeof PROFILE_FIELDS)[number];
type ProfileSnapshot = Partial<Record<ProfileField, string | null>>;

/** Faqat haqiqatan o'zgargan maydonlar (bir xil qiymat — o'zgarish emas, audit yozilmaydi). */
export function diffChanges(target: UserAccountRecord, changes: AccountChanges): AccountChanges {
  const diff: AccountChanges = {};
  for (const field of PROFILE_FIELDS) {
    const next = changes[field];
    if (next !== undefined && next !== target[field]) {
      diff[field] = next;
    }
  }
  if (changes.status !== undefined && changes.status !== target.status) {
    diff.status = changes.status;
  }
  return diff;
}

function profileSnapshots(
  target: UserAccountRecord,
  diff: AccountChanges,
): { before: ProfileSnapshot; after: ProfileSnapshot } | null {
  const fields = PROFILE_FIELDS.filter((field) => diff[field] !== undefined);
  if (fields.length === 0) {
    return null;
  }
  return {
    before: Object.fromEntries(fields.map((field) => [field, target[field]])),
    after: Object.fromEntries(fields.map((field) => [field, diff[field]])),
  };
}

/**
 * Akkauntni o'zgartirish (PATCH, docs/12 §2): ism, familiya, telefon, holat. Yozuv va audit —
 * bitta tranzaksiyada (`UnitOfWork`); deaktivatsiyada `token_version++` va refresh tokenlar bekor
 * (o'sha yozuvda), keyin kesh va ota-ona sessiyalari (`AccountStatusService`).
 * Audit: `USER_UPDATED` (profil maydonlari: oldin/keyin), `USER_DEACTIVATED`/`USER_ACTIVATED`.
 */
@Injectable()
export class AccountUpdateService {
  constructor(
    private readonly accounts: UserAccountsRepository,
    private readonly audit: AuditService,
    private readonly unitOfWork: UnitOfWork,
    private readonly status: AccountStatusService,
  ) {}

  async update(
    target: UserAccountRecord,
    changes: AccountChanges,
    actor: ActorContext,
  ): Promise<void> {
    const diff = diffChanges(target, changes);
    if (Object.keys(diff).length === 0) {
      return;
    }
    if (diff.phone !== undefined && (await this.accounts.isPhoneTaken(diff.phone, target.id))) {
      throw phoneTakenException();
    }
    const { tokenVersion } = await this.unitOfWork.run(async () => {
      const result = await this.accounts.applyChanges(target.id, diff, new Date());
      await this.recordAudit(target, diff, actor);
      return result;
    });
    if (diff.status !== undefined) {
      await this.status.onStatusChanged(target, diff.status, tokenVersion);
    }
  }

  private async recordAudit(
    target: UserAccountRecord,
    diff: AccountChanges,
    actor: ActorContext,
  ): Promise<void> {
    const base = {
      actor: auditActor(actor.user),
      entityType: AuditEntityType.USER,
      entityId: target.id,
      ip: actor.meta.ip,
    };
    const profile = profileSnapshots(target, diff);
    if (profile) {
      await this.audit.record({
        ...base,
        action: AuditAction.USER_UPDATED,
        before: { role: target.role, ...profile.before },
        after: { role: target.role, ...profile.after },
      });
    }
    if (diff.status !== undefined) {
      await this.audit.record({
        ...base,
        action:
          diff.status === UserStatus.INACTIVE
            ? AuditAction.USER_DEACTIVATED
            : AuditAction.USER_ACTIVATED,
        before: { role: target.role, status: target.status },
        after: { role: target.role, status: diff.status },
      });
    }
  }
}
