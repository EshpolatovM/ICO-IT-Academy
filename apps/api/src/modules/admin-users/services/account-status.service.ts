import { Injectable } from '@nestjs/common';

import { Role, UserStatus } from '@lms/shared';

import { TokenVersionService } from '../../auth/services/token-version.service.js';
import { MentorScopeCache } from '../../groups/services/mentor-scope-cache.service.js';
import { ParentAccessSuspensionService } from '../../parent-access/services/parent-access-suspension.service.js';

import type { UserAccountRecord } from '../admin-users.types.js';

/**
 * Holat o'zgargandan (tranzaksiya yakunlangandan) keyingi tashqi amallar (docs/02 §3, §6):
 * - INACTIVE: `token_version` keshi yangilanadi (eski access tokenlar darhol 401; refresh
 *   tokenlar shu tranzaksiyada bekor qilingan), student bo'lsa — ota-ona sessiyalari to'xtatiladi;
 * - ACTIVE: student bo'lsa — ota-ona tokenlari keshidagi to'xtatish belgisi olib tashlanadi.
 *   Aktivatsiyada `token_version` oshirilmaydi (eski tokenlar deaktivatsiyada yaroqsiz bo'lgan).
 * - MENTOR deaktivatsiyasi: guruhlardan `mentor_id` olib tashlanmaydi (aktivatsiyada qayta ishlaydi,
 *   admin `PUT /admin/groups/:id/mentor` bilan almashtiradi), faqat scope keshi invalidatsiya qilinadi.
 * - STUDENT deaktivatsiyasi faol a'zolikka tegmaydi: deaktivatsiya qaytariladigan amal (S-08 A),
 *   a'zolik tarixi saqlanadi; scope qoidasi (docs/01 §3.1) student holatiga bog'liq emas — mentor
 *   studentni INACTIVE holati bilan ko'radi.
 */
@Injectable()
export class AccountStatusService {
  constructor(
    private readonly tokenVersions: TokenVersionService,
    private readonly parentAccess: ParentAccessSuspensionService,
    private readonly mentorScopes: MentorScopeCache,
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
      if (target.role === Role.MENTOR) {
        await this.mentorScopes.invalidate(target.id);
      }
      return;
    }
    if (isStudent) {
      await this.parentAccess.resumeStudent(target.id);
    }
  }
}
