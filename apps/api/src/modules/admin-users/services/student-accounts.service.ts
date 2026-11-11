import { Injectable } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { CreatedStudentResponse, StudentDetail } from '@lms/shared';

import { toStudentItem } from '../mappers/user-account.mapper.js';
import { UserAccountsRepository } from '../repositories/user-accounts.repository.js';
import { UserSearchRepository } from '../repositories/user-search.repository.js';

import { AccountUpdateService } from './account-update.service.js';
import { ManagedAccountsService } from './managed-accounts.service.js';
import { StudentAccountCreator } from './student-account-creator.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { UserAccountRecord } from '../admin-users.types.js';
import type { CreateStudentDto } from '../dto/admin-users.dto.js';

/** Studentlarni boshqarish — super admin va admin (`/admin/students`, docs/01 §2.1). */
@Injectable()
export class StudentAccountsService extends ManagedAccountsService<StudentDetail> {
  protected readonly role = Role.STUDENT;

  constructor(
    accounts: UserAccountsRepository,
    search: UserSearchRepository,
    updater: AccountUpdateService,
    private readonly creator: StudentAccountCreator,
  ) {
    super(accounts, search, updater);
  }

  create(request: CreateStudentDto, actor: ActorContext): Promise<CreatedStudentResponse> {
    return this.creator.create(request, actor);
  }

  protected toItem(record: UserAccountRecord): StudentDetail {
    return toStudentItem(record);
  }
}
