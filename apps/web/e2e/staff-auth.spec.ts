import { expect, test } from '@playwright/test';

import { expectPath, loginAsStaff } from './support/auth';
import { e2eUsers } from './support/e2e-users';

/** Super admin'ga xos menyu bandlari (nav.config: `superAdminOnly`). */
const SUPER_ADMIN_ITEMS = ['Adminlar', 'Tizim sozlamalari', 'Audit'];

test.describe('Xodim kirishi', () => {
  test('(a) mentor: /mentor, F5 dan keyin sessiya saqlanadi, /admin → /mentor, chiqish → /login/staff', async ({
    page,
  }) => {
    const { mentor, password } = e2eUsers();
    await loginAsStaff(page, mentor, password);
    await expectPath(page, '/mentor');
    await expect(page.getByText(`${mentor.firstName} ${mentor.lastName}`)).toBeVisible();

    await page.reload();
    await expectPath(page, '/mentor');
    await expect(page.getByRole('button', { name: 'Chiqish' })).toBeVisible();

    await page.goto('/admin');
    await expectPath(page, '/mentor');

    await page.getByRole('button', { name: 'Chiqish' }).click();
    await expectPath(page, '/login/staff');
    await page.goto('/mentor');
    await expectPath(page, '/login/staff');
  });

  test("(b) admin: /admin, super admin bandlari ko'rinmaydi; super admin'ga ko'rinadi", async ({
    browser,
  }) => {
    const { admin, superAdmin, password } = e2eUsers();

    const adminPage = await (await browser.newContext()).newPage();
    await loginAsStaff(adminPage, admin, password);
    await expectPath(adminPage, '/admin');
    await expect(adminPage.getByRole('link', { name: 'Foydalanuvchilar' })).toBeVisible();
    for (const item of SUPER_ADMIN_ITEMS) {
      await expect(adminPage.getByRole('link', { name: item })).toHaveCount(0);
    }

    const superPage = await (await browser.newContext()).newPage();
    await loginAsStaff(superPage, superAdmin, password);
    await expectPath(superPage, '/admin');
    for (const item of SUPER_ADMIN_ITEMS) {
      await expect(superPage.getByRole('link', { name: item })).toBeVisible();
    }
  });

  test("(d) noto'g'ri parol — umumiy xato xabari, sahifada qoladi", async ({ page }) => {
    const { mentor } = e2eUsers();
    await loginAsStaff(page, mentor, 'NotoGri123');

    await expect(page.getByTestId('staff-login-form').getByRole('alert')).toHaveText(
      "Login yoki parol noto'g'ri",
    );
    await expectPath(page, '/login/staff');
  });

  test('(h) bir nechta tab bir vaqtda sessiyani tiklaydi — hech biri chiqarib yuborilmaydi (H2)', async ({
    page,
    context,
  }) => {
    const { admin, password } = e2eUsers();
    await loginAsStaff(page, admin, password);
    await expectPath(page, '/admin');

    // Har bir yangi tab access token'siz ochiladi va bir vaqtda `POST /auth/refresh` qiladi.
    const tabs = await Promise.all([context.newPage(), context.newPage(), context.newPage()]);
    await Promise.all(tabs.map((tab) => tab.goto('/admin')));
    for (const tab of [...tabs, page]) {
      await expectPath(tab, '/admin');
      await expect(tab.getByRole('button', { name: 'Chiqish' })).toBeVisible();
    }

    await page.reload();
    await expectPath(page, '/admin');
    await expect(page.getByRole('button', { name: 'Chiqish' })).toBeVisible();
  });
});
