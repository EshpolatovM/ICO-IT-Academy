import { E2E_USERS_ENV } from './e2e-env';
import { e2eUserIds } from './e2e-users';
import { deleteUsers, runUsersScript } from './users-script';

import type { E2eUsers } from './e2e-users';

/**
 * Test foydalanuvchilarini API orqali emas, bazaga to'g'ridan-to'g'ri (apps/api seed kutubxonasi)
 * yaratadi va worker'larga env orqali uzatadi. Qaytarilgan funksiya — teardown: faqat shu
 * foydalanuvchilar va ularga bog'liq yozuvlar o'chiriladi (dev seed'ga tegilmaydi).
 */
export default function globalSetup(): () => void {
  const users = JSON.parse(runUsersScript(['create'])) as E2eUsers;
  process.env[E2E_USERS_ENV] = JSON.stringify(users);
  return () => {
    deleteUsers(e2eUserIds(users));
  };
}
