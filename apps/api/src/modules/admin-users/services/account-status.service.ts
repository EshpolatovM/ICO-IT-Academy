import { Injectable } from '@nestjs/common';

import { Role, UserStatus } from '@lms/shared';

import { TokenVersionService } from '../../auth/services/token-version.service.js';
import { ParentAccessSuspensionService } from '../../parent-access/services/parent-access-suspension.service.js';

import type { UserAccountRecord } from '../admin-users.types.js';

/**
 * Holat o'zgargandan (tranzaksiya yakunlangandan) keyingi tashqi amallar (docs/02 §3, §6):
 * - INACTIVE: `token_version` keshi yangilanadi (eski access tokenlar darhol 401; refresh
 *   tokenlar shu tranzaksiyada bekor qilingan), student bo'lsa — ota-ona sessiyalari to'xtatiladi;
 * - ACTIVE: student bo'lsa — ota-ona tokenlari keshidagi to'xtatish belgisi olib tashlanadi.
 *   Aktivatsiyada `token_version` oshirilmaydi (eski tokenlar deaktivatsiyada yaroqsiz bo'lgan).
 */
@Injectable()
export class AccountStatusService {
  constructor(
    private readonly tokenVersions: TokenVersionService,
    private readonly parentAccess: ParentAccessSuspensionService,
  ) {}

  async onStatusChanged(
    target: Pick<UserAccountRecord, 'id' | 'role'>,
    status: UserStatus,
    tokenVersion: number,
  ): Promise<void> {
    const isStudent = target.role === Role.STUDENT;
    if (status === UserStatus.INACTIVE) {
      await this.tokenVersions.onVersionChanged(target.id, tokenVersion);
      if (isStudent) {
        await this.parentAccess.suspendStudent(target.id);
      }
      return;
    }
    if (isStudent) {
      await this.parentAccess.resumeStudent(target.id);
    }
  }
}
