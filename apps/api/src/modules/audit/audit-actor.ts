import { Role } from '@lms/shared';

import type { AuditEntry } from './audit.types.js';
import type { RequestUser } from '../../common/auth/request-user.types.js';

/**
 * So'rov egasidan audit `actor` i. Ota-ona akkauntsiz (`id` — token id, `users` FK emas),
 * shuning uchun u uchun `null` (ota-ona baribir mutatsiya qila olmaydi).
 */
export function auditActor(user: RequestUser): AuditEntry['actor'] {
  return user.role === Role.PARENT ? null : { id: user.id, role: user.role };
}
