import { E2E_USERS_ENV } from './e2e-env';

/** `apps/api/test/support/web-e2e-users.ts create` natijasi. */
export interface E2eUser {
  id: string;
  /** Xodim — telefon, student — student kodi. */
  login: string;
  firstName: string;
  lastName: string;
}

export interface E2eUsers {
  password: string;
  superAdmin: E2eUser;
  admin: E2eUser;
  mentor: E2eUser;
  /** `mustChangePassword = true` bo'lgan yangi student. */
  newStudent: E2eUser;
  /** Ota-ona ssenariysi uchun farzand. */
  child: E2eUser;
}

/** Global setup'da yaratilgan test foydalanuvchilari (worker'da env'dan o'qiladi). */
export function e2eUsers(): E2eUsers {
  const raw = process.env[E2E_USERS_ENV];
  if (raw === undefined) {
    throw new Error(`${E2E_USERS_ENV} berilmagan — global setup ishlamagan.`);
  }
  return JSON.parse(raw) as E2eUsers;
}

/** Barcha test foydalanuvchilari id'lari (teardown uchun). */
export function e2eUserIds(users: E2eUsers): string[] {
  return [users.superAdmin, users.admin, users.mentor, users.newStudent, users.child].map(
    (user) => user.id,
  );
}
