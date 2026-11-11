import { Injectable } from '@nestjs/common';

import type { CreatedStaffResponse } from '@lms/shared';

import { UserAccountsRepository } from '../repositories/user-accounts.repository.js';
import { UserSearchRepository } from '../repositories/user-search.repository.js';

import { AccountUpdateService } from './account-update.service.js';
import { ManagedAccountsService } from './managed-accounts.service.js';
import { StaffAccountCreator } from './staff-account-creator.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { ManagedStaffRole } from '../admin-users.types.js';
import type { CreateStaffDto } from '../dto/admin-users.dto.js';

/**
 * Xodim (admin, mentor) akkauntlari uchun umumiy asos: yaratish telefon bilan. Merosxo'r faqat
 * `role` va `toItem` ni beradi (konstruktor shu class'dan — DI metadata `@Injectable` orqali).
 */
@Injectable()
export abstract class StaffAccountsService<TItem> extends ManagedAccountsService<TItem> {
  protected abstract override readonly role: ManagedStaffRole;

  constructor(
    accounts: UserAccountsRepository,
    search: UserSearchRepository,
    updater: AccountUpdateService,
    private readonly creator: StaffAccountCreator,
  ) {
    super(accounts, search, updater);
  }

  create(request: CreateStaffDto, actor: ActorContext): Promise<CreatedStaffResponse> {
    return this.creator.create(this.role, request, actor);
  }
}
