import { randomBytes, randomInt } from 'node:crypto';

import { expect, test as base } from '@playwright/test';

import { staffAccessToken } from './admin-api';
import { expectPath, loginAsStaff } from './auth';
import { e2eUsers } from './e2e-users';
import { retireGroupViaApi } from './groups-api';
import { deleteUsers } from './users-script';

import type { E2eUser } from './e2e-users';
import type { Locator, Page } from '@playwright/test';

const API_PREFIX = '/api/v1';
const HTTP_CREATED = 201;
const NAME_SUFFIX_BYTES = 4;
/** `+99877XXXXXXX` — apps/api test telefonlari bilan bir xil diapazon (dev yozuvlariga to'qnashmaydi). */
const TEST_PHONE_PREFIX = '+99877';
const TEST_PHONE_SUFFIX_MAX = 10_000_000;
const TEST_PHONE_SUFFIX_DIGITS = String(TEST_PHONE_SUFFIX_MAX - 1).length;

/** Admin API sessiyasi va test yaratgan yozuvlar (test oxirida tozalanadi). */
export interface AdminApi {
  token: string;
  /** Test yaratgan foydalanuvchi id'larini teardown ro'yxatiga qo'shadi. */
  track: (...ids: string[]) => void;
  /** Test yaratgan guruh id'larini teardown ro'yxatiga qo'shadi. */
  trackGroups: (...ids: string[]) => void;
}

/**
 * `adminApi` fixture: oddiy admin access token'i. Test tugagach (yiqilsa ham): `trackGroups`
 * qilingan guruhlar mentorsiz, a'zosiz va arxivlangan holga keltiriladi (o'chirish API'si yo'q),
 * so'ng `track` qilingan foydalanuvchilar bazadan o'chiriladi — dev ma'lumotlari ifloslanmaydi.
 */
export const test = base.extend<{ adminApi: AdminApi }>({
  adminApi: async ({ request }, use) => {
    const { admin, password } = e2eUsers();
    const ids: string[] = [];
    const groupIds: string[] = [];
    const token = await staffAccessToken(request, admin, password);
    await use({
      token,
      track: (...created) => ids.push(...created),
      trackGroups: (...created) => groupIds.push(...created),
    });
    try {
      for (const groupId of groupIds) {
        await retireGroupViaApi(request, token, groupId);
      }
    } finally {
      deleteUsers(ids);
    }
  },
});

export { expect };

/** Test guruhi nomi: `e2e-` prefiksi + unikal qism. */
export function uniqueGroupName(prefix: string): string {
  return `e2e-${uniqueName(prefix)}`;
}

/** Unikal ism/familiya (faqat harflar) — mavjud yozuvlarga tayanmaslik uchun. */
export function uniqueName(prefix: string): string {
  const suffix = randomBytes(NAME_SUFFIX_BYTES)
    .toString('hex')
    .replace(/\d/g, (digit) => String.fromCharCode('a'.charCodeAt(0) + Number(digit)));
  return `${prefix}${suffix}`;
}

/** Unikal test telefoni (E.164). */
export function uniqueTestPhone(): string {
  const suffix = String(randomInt(TEST_PHONE_SUFFIX_MAX)).padStart(TEST_PHONE_SUFFIX_DIGITS, '0');
  return `${TEST_PHONE_PREFIX}${suffix}`;
}

/** Xodim sifatida kirib, `/admin` ochilguncha kutadi. */
export async function loginToAdmin(page: Page, user: E2eUser): Promise<void> {
  await loginAsStaff(page, user, e2eUsers().password);
  await expectPath(page, '/admin');
}

/**
 * Web orqali (Next rewrite) ketgan `POST /api/v1{path}` ning 201 javobini kutadi. Amaldan OLDIN
 * chaqiriladi, so'ng `await` qilinadi.
 */
export async function createdResponse<T>(page: Page, path: string): Promise<T> {
  const response = await page.waitForResponse(
    (candidate) =>
      candidate.request().method() === 'POST' &&
      new URL(candidate.url()).pathname === `${API_PREFIX}${path}` &&
      candidate.status() === HTTP_CREATED,
  );
  return (await response.json()) as T;
}

/** Ro'yxat qidiruvi (debounce) — so'rov URL query'ga yozilguncha kutadi. */
export async function searchList(page: Page, q: string): Promise<void> {
  await page.getByRole('searchbox', { name: 'Qidiruv' }).fill(q);
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(q);
}

/** Jadvaldagi matnli qator. */
export function tableRow(page: Page, text: string): Locator {
  return page.getByRole('row').filter({ hasText: text });
}

/** `SecretReveal` dagi maxfiy qiymat (masalan "Vaqtinchalik parol"). */
export function secretValue(scope: Page | Locator, label: string): Locator {
  return scope.getByRole('group', { name: label }).locator('code');
}

/** `ConfirmDialog` (alertdialog) dagi tasdiqlash tugmasini bosadi va oyna yopilguncha kutadi. */
export async function confirmInDialog(page: Page, button: string): Promise<void> {
  const confirm = page.getByRole('alertdialog');
  await confirm.getByRole('button', { name: button }).click();
  await expect(confirm).toBeHidden();
}
