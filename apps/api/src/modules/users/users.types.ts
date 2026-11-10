import type { AccountRole, UserStatus } from '@lms/shared';

/** Auth uchun kerakli foydalanuvchi maydonlari (repository'dan tashqarida Prisma tiplari ishlatilmaydi). */
export interface UserAuthRecord {
  id: string;
  role: AccountRole;
  phone: string | null;
  studentCode: string | null;
  passwordHash: string;
  mustChangePassword: boolean;
  tokenVersion: number;
  firstName: string;
  lastName: string;
  status: UserStatus;
}

/** Parolni almashtirish natijasi (docs/02 §4.2). */
export interface PasswordChangeResult {
  tokenVersion: number;
}
