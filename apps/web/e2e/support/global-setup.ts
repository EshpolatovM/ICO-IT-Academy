import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { E2E_USERS_ENV } from './e2e-env';
import { e2eUserIds } from './e2e-users';

import type { E2eUsers } from './e2e-users';

/**
 * Test foydalanuvchilarini API orqali emas, bazaga to'g'ridan-to'g'ri (apps/api seed kutubxonasi)
 * yaratadi va worker'larga env orqali uzatadi. Qaytarilgan funksiya — teardown: faqat shu
 * foydalanuvchilar va ularga bog'liq yozuvlar o'chiriladi (dev seed'ga tegilmaydi).
 */
const API_DIR = path.resolve(__dirname, '..', '..', '..', 'api');
const USERS_SCRIPT = ['--env-file-if-exists=../../.env', 'test/support/web-e2e-users.ts'];

function runUsersScript(args: readonly string[]): string {
  return execFileSync(
    path.join(API_DIR, 'node_modules', '.bin', 'tsx'),
    [...USERS_SCRIPT, ...args],
    {
      cwd: API_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  );
}

export default function globalSetup(): () => void {
  const users = JSON.parse(runUsersScript(['create'])) as E2eUsers;
  process.env[E2E_USERS_ENV] = JSON.stringify(users);
  return () => {
    runUsersScript(['delete', ...e2eUserIds(users)]);
  };
}
