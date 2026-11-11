import type { AuthUser } from '@lms/shared';

import type { UserAuthRecord } from '../../users/users.types.js';

/** Login va `GET /auth/me` javobidagi foydalanuvchi (docs/12 §1). Hash va versiya chiqmaydi. */
export function toAuthUser(user: UserAuthRecord): AuthUser {
  return {
    id: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    ...(user.phone === null ? {} : { phone: user.phone }),
    ...(user.studentCode === null ? {} : { studentCode: user.studentCode }),
    mustChangePassword: user.mustChangePassword,
  };
}
