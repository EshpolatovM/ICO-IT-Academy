import type { CreatedStudentResponse } from '@lms/shared';

import { createStudentViaApi, studentLoginStatus } from './support/admin-api';
import {
  createdResponse,
  expect,
  loginToAdmin,
  searchList,
  secretValue,
  tableRow,
  test,
  uniqueName,
} from './support/admin-fixtures';
import { requiredField } from './support/auth';
import { e2eUsers } from './support/e2e-users';

test.describe('Admin: studentlar', () => {
  test('(1) student yaratish → vaqtinchalik parol bir marta → qidiruvda topiladi', async ({
    page,
    adminApi,
  }) => {
    const firstName = 'Etest';
    const lastName = uniqueName('Yaratildi');
    await loginToAdmin(page, e2eUsers().admin);
    await page.goto('/admin/students');
    await expect(page.getByRole('heading', { name: 'Studentlar', level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'Yangi student' }).click();
    const dialog = page.getByRole('dialog');
    await requiredField(page, 'Ism').fill(firstName);
    await requiredField(page, 'Familiya').fill(lastName);
    const created = createdResponse<CreatedStudentResponse>(page, '/admin/students');
    await dialog.getByRole('button', { name: 'Yaratish' }).click();
    const student = await created;
    adminApi.track(student.id);

    expect(student.studentCode).toMatch(/^ST-\d+$/);
    expect(student.temporaryPassword).not.toBeNull();
    const password = student.temporaryPassword ?? '';
    await expect(dialog.getByRole('heading', { name: 'Akkaunt yaratildi' })).toBeVisible();
    await expect(dialog).toContainText(`${firstName} ${lastName}`);
    await expect(dialog).toContainText(student.studentCode);
    await expect(secretValue(dialog, 'Vaqtinchalik parol')).toHaveText(password);

    // "Bir marta": oyna yopilgach parol sahifada qolmaydi, qayta ochilganda bo'sh forma.
    await dialog.getByRole('button', { name: 'Tayyor' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(password)).toHaveCount(0);
    await page.getByRole('button', { name: 'Yangi student' }).click();
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Yangi student' }),
    ).toBeVisible();
    await expect(requiredField(page, 'Ism')).toHaveValue('');
    await expect(page.getByText(password)).toHaveCount(0);
    await page.getByRole('dialog').getByRole('button', { name: 'Bekor qilish' }).click();

    await searchList(page, lastName);
    await expect(tableRow(page, lastName)).toHaveCount(1);
    await expect(tableRow(page, lastName)).toContainText(student.studentCode);
    await expect(tableRow(page, lastName)).toContainText('Faol');

    await searchList(page, student.studentCode);
    await expect(tableRow(page, student.studentCode)).toContainText(`${firstName} ${lastName}`);
  });

  test('(2) tafsilot: ism tahrirlanadi, deaktivatsiya/aktivatsiya, parol tiklanadi', async ({
    page,
    request,
    adminApi,
  }) => {
    const lastName = uniqueName('Tafsilot');
    const student = await createStudentViaApi(request, adminApi.token, {
      firstName: 'Eski',
      lastName,
    });
    adminApi.track(student.id);
    await loginToAdmin(page, e2eUsers().admin);
    await page.goto(`/admin/students/${student.id}`);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText(`Eski ${lastName}`);

    // Tahrirlash
    await requiredField(page, 'Ism').fill('Yangi');
    await page.getByRole('button', { name: 'Saqlash' }).click();
    await expect(page.getByText('Saqlandi')).toBeVisible();
    await expect(heading).toHaveText(`Yangi ${lastName}`);
    await page.reload();
    await expect(heading).toHaveText(`Yangi ${lastName}`);

    // Deaktivatsiya
    await page.getByRole('button', { name: 'Deaktivatsiya', exact: true }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toContainText('deaktivatsiya qilinsinmi?');
    await confirm.getByRole('button', { name: 'Deaktivatsiya qilish' }).click();
    await expect(confirm).toBeHidden();
    await expect(page.getByRole('button', { name: 'Faollashtirish' })).toBeVisible();
    await expect(page.getByText('Nofaol').first()).toBeVisible();
    expect(
      await studentLoginStatus(request, student.studentCode, student.temporaryPassword ?? ''),
    ).not.toBe(200);

    // Aktivatsiya
    await page.getByRole('button', { name: 'Faollashtirish' }).click();
    await expect(confirm).toContainText('faollashtirilsinmi?');
    await confirm.getByRole('button', { name: 'Faollashtirish' }).click();
    await expect(confirm).toBeHidden();
    await expect(page.getByRole('button', { name: 'Deaktivatsiya', exact: true })).toBeVisible();
    await expect(page.getByText('Nofaol')).toHaveCount(0);

    // Parolni tiklash: yangi vaqtinchalik parol bir marta ko'rinadi va u bilan kirish mumkin.
    await page.getByRole('button', { name: 'Parolni tiklash' }).click();
    await expect(confirm).toContainText('parol tiklansinmi?');
    await confirm.getByRole('button', { name: 'Tiklash' }).click();
    const result = page.getByRole('dialog').filter({ hasText: 'Parol tiklandi' });
    await expect(result).toContainText(student.studentCode);
    const newPassword = (await secretValue(result, 'Vaqtinchalik parol').textContent()) ?? '';
    expect(newPassword).not.toBe('');
    expect(newPassword).not.toBe(student.temporaryPassword);
    await result.getByRole('button', { name: 'Tayyor' }).click();
    await expect(result).toBeHidden();
    await expect(page.getByText(newPassword)).toHaveCount(0);

    expect(await studentLoginStatus(request, student.studentCode, newPassword)).toBe(200);
    expect(
      await studentLoginStatus(request, student.studentCode, student.temporaryPassword ?? ''),
    ).not.toBe(200);
  });
});
