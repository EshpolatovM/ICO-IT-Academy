import { expect, test } from '@playwright/test';

import { expectPath, loginAsStudent, requiredField } from './support/auth';
import { e2eUsers } from './support/e2e-users';

const NEW_PASSWORD = 'Yangi$Parol9';

test.describe('Student kirishi va route guard', () => {
  test("(c) yangi student: /change-password majburiy, /path ga o'tib bo'lmaydi, almashtirgach — /path", async ({
    page,
  }) => {
    const { newStudent, password } = e2eUsers();
    await loginAsStudent(page, newStudent, password);
    await expectPath(page, '/change-password');

    await page.goto('/path');
    await expectPath(page, '/change-password');

    await requiredField(page, 'Joriy parol').fill(password);
    await requiredField(page, 'Yangi parol').fill(NEW_PASSWORD);
    await requiredField(page, 'Yangi parolni takrorlang').fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Parolni saqlash' }).click();

    await expectPath(page, '/path');
    await page.reload();
    await expectPath(page, '/path');
  });

  test('(f) sessiyasiz: /path → /login, /mentor → /login/staff', async ({ page }) => {
    await page.goto('/path');
    await expectPath(page, '/login');
    await expect(requiredField(page, 'Student ID')).toBeVisible();

    await page.goto('/mentor');
    await expectPath(page, '/login/staff');
    await expect(requiredField(page, 'Telefon raqam')).toBeVisible();
  });
});
