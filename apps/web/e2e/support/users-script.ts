import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * `apps/api/test/support/web-e2e-users.ts` skripti — test foydalanuvchilarini API orqali emas,
 * bazaga to'g'ridan-to'g'ri yaratadi/o'chiradi (apps/api seed kutubxonasi bilan).
 */
const API_DIR = path.resolve(__dirname, '..', '..', '..', 'api');
const USERS_SCRIPT = ['--env-file-if-exists=../../.env', 'test/support/web-e2e-users.ts'];

export function runUsersScript(args: readonly string[]): string {
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

/** Faqat berilgan id'lar va ularga bog'liq yozuvlar (audit, sessiyalar ...) o'chiriladi. */
export function deleteUsers(ids: readonly string[]): void {
  if (ids.length > 0) {
    runUsersScript(['delete', ...ids]);
  }
}
