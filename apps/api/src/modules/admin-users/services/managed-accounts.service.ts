import { ErrorCode } from '@lms/shared';
import type { PaginatedResult } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { selfManagementException } from '../admin-users.errors.js';
import { buildUserSearchTerm } from '../user-search-term.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type {
  AccountChanges,
  ManagedRole,
  UserAccountRecord,
  UserListQuery,
} from '../admin-users.types.js';
import type { AccountUpdateService } from './account-update.service.js';
import type { UserAccountsRepository } from '../repositories/user-accounts.repository.js';
import type { UserSearchRepository } from '../repositories/user-search.repository.js';

/**
 * Bitta rol akkauntlarini boshqarish (ro'yxat, tafsilot, o'zgartirish) — admin, mentor va student
 * servislari uchun umumiy asos. Ruxsat matritsasi (docs/01 §2.1, S-07 A, S-11 A) endpoint
 * `@Roles` ida; bu yerda: faqat o'z rolidagi akkaunt (boshqasi — 404, SUPER_ADMIN hech qachon
 * nishon bo'lmaydi), o'z akkauntini boshqaruv endpointi orqali o'zgartirish — 403.
 */
export abstract class ManagedAccountsService<TItem> {
  protected abstract readonly role: ManagedRole;

  constructor(
    protected readonly accounts: UserAccountsRepository,
    private readonly search: UserSearchRepository,
    private readonly updater: AccountUpdateService,
  ) {}

  protected abstract toItem(record: UserAccountRecord): TItem;

  async list(query: UserListQuery): Promise<PaginatedResult<TItem>> {
    const page = await this.search.search({
      role: this.role,
      status: query.status,
      groupId: query.groupId,
      search: buildUserSearchTerm(query.q, this.role),
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
    const records = await this.accounts.findAccountsByIds(page.ids);
    return {
      items: records.map((record) => this.toItem(record)),
      total: page.total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async get(id: string): Promise<TItem> {
    return this.toItem(await this.findTarget(id));
  }

  async update(id: string, changes: AccountChanges, actor: ActorContext): Promise<TItem> {
    if (id === actor.user.id) {
      throw selfManagementException();
    }
    await this.updater.update(await this.findTarget(id), changes, actor);
    return this.get(id);
  }

  private async findTarget(id: string): Promise<UserAccountRecord> {
    const record = await this.accounts.findAccount(id);
    if (record?.role !== this.role) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
    return record;
  }
}
