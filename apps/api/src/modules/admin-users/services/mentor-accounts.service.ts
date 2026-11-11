import { Injectable } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { MentorDetail } from '@lms/shared';

import { toMentorItem } from '../mappers/user-account.mapper.js';

import { StaffAccountsService } from './staff-accounts.service.js';

import type { UserAccountRecord } from '../admin-users.types.js';

/** Mentorlarni boshqarish — super admin va admin (`/admin/mentors`, docs/01 §2.1, S-07 A). */
@Injectable()
export class MentorAccountsService extends StaffAccountsService<MentorDetail> {
  protected readonly role = Role.MENTOR;

  protected toItem(record: UserAccountRecord): MentorDetail {
    return toMentorItem(record);
  }
}
