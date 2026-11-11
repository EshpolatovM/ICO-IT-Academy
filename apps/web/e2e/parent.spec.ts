import { expect, test } from '@playwright/test';

import type { LoginResponse, ParentTokenCreatedResponse } from '@lms/shared';

import { expectPath, requiredField } from './support/auth';
import { E2E_API_URL } from './support/e2e-env';
import { e2eUsers } from './support/e2e-users';

import type { APIRequestContext } from '@playwright/test';

/** Admin API orqali farzandga ota-ona tokeni yaratadi (docs/02 §4.4); havola `#t=` (S-70). */
async function issueParentToken(
  request: APIRequestContext,
): Promise<Pick<ParentTokenCreatedResponse, 'token' | 'link'>> {
  const { admin, child, password } = e2eUsers();
  const login = await request.post(`${E2E_API_URL}/api/v1/auth/staff/login`, {
    data: { phone: admin.login, password },
  });
  expect(login.status()).toBe(200);
  const { accessToken } = (await login.json()) as LoginResponse;

  const created = await request.post(`${E2E_API_URL}/api/v1/students/${child.id}/parent-tokens`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { label: 'E2E' },
  });
  expect(created.status()).toBe(201);
  const { token, link } = (await created.json()) as ParentTokenCreatedResponse;
  return { token, link };
}

const EXCHANGE_PATH = '/api/v1/auth/parent/exchange';
const ME_PATH = '/api/v1/auth/me';

test("(e) ota-ona: havola → token URL'dan yo'qoladi → kartochka → qayta yuklash (exchange yo'q) → chiqish", async ({
  page,
  request,
}) => {
  const { child } = e2eUsers();
  const { token, link } = await issueParentToken(request);
  const linkUrl = new URL(link);
  expect(linkUrl.pathname).toBe('/parent');
  expect(linkUrl.search).toBe('');
  expect(linkUrl.hash).toBe(`#t=${token}`);

  await page.goto(`${linkUrl.pathname}${linkUrl.hash}`);
  await expectPath(page, '/parent');
  await expect.poll(() => page.url()).not.toContain(token);
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('');

  const card = page.getByTestId('parent-child-card');
  await expect(card).toContainText(`${child.firstName} ${child.lastName}`);

  // H3: `ps` amalda — qayta yuklashda faqat GET /auth/me, exchange CHAQIRILMAYDI (IP limiti to'lmaydi).
  const apiPaths: string[] = [];
  page.on('request', (request) => {
    apiPaths.push(new URL(request.url()).pathname);
  });
  const reloaded = await page.reload();
  expect(reloaded?.headers()['referrer-policy']).toBe('no-referrer');
  await expect(card).toContainText(`${child.firstName} ${child.lastName}`);
  expect(apiPaths).toContain(ME_PATH);
  expect(apiPaths).not.toContain(EXCHANGE_PATH);

  await page.getByRole('button', { name: 'Chiqish' }).click();
  await expectPath(page, '/parent');
  await expect(requiredField(page, 'Kirish kodi')).toBeVisible();
  await expect(card).toHaveCount(0);
});
