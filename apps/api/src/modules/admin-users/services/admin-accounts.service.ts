import { Injectable } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { AdminUserListItem } from '@lms/shared';

import { toAdminItem } from '../mappers/user-account.mapper.js';

import { StaffAccountsService } from './staff-accounts.service.js';

import type { UserAccountRecord } from '../admin-users.types.js';

/** Adminlarni boshqarish — faqat super admin (`/super/admins`, docs/01 §2.1, S-11 A). */
@Injectable()
export class AdminAccountsService extends StaffAccountsService<AdminUserListItem> {
  protected readonly role = Role.ADMIN;

  protected toItem(record: UserAccountRecord): AdminUserListItem {
    return toAdminItem(record);
  }
}
