import type { CreatedStaffResponse } from '@lms/shared';

import { createMentorViaApi } from './support/admin-api';
import {
  createdResponse,
  expect,
  loginToAdmin,
  searchList,
  secretValue,
  tableRow,
  test,
  uniqueName,
  uniqueTestPhone,
} from './support/admin-fixtures';
import { requiredField } from './support/auth';
import { e2eUsers } from './support/e2e-users';

const PHONE_TAKEN = 'Bu telefon raqam boshqa akkauntda band';

test.describe('Admin: mentorlar', () => {
  test('(4a) mentor yaratish va tahrirlash', async ({ page, adminApi }) => {
    const phone = uniqueTestPhone();
    const lastName = uniqueName('Mentor');
    await loginToAdmin(page, e2eUsers().admin);
    await page.goto('/admin/mentors');
    await expect(page.getByRole('heading', { name: 'Mentorlar', level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'Yangi mentor' }).click();
    const dialog = page.getByRole('dialog');
    await requiredField(page, 'Telefon raqam').fill(phone);
    await requiredField(page, 'Ism').fill('Etest');
    await requiredField(page, 'Familiya').fill(lastName);
    const created = createdResponse<CreatedStaffResponse>(page, '/admin/mentors');
    await dialog.getByRole('button', { name: 'Yaratish' }).click();
    const mentor = await created;
    adminApi.track(mentor.id);

    await expect(dialog.getByRole('heading', { name: 'Akkaunt yaratildi' })).toBeVisible();
    await expect(dialog).toContainText(phone);
    await expect(secretValue(dialog, 'Vaqtinchalik parol')).toHaveText(
      mentor.temporaryPassword ?? '',
    );
    await dialog.getByRole('button', { name: 'Tayyor' }).click();
    await expect(dialog).toBeHidden();

    await searchList(page, phone);
    const row = tableRow(page, phone);
    await expect(row).toContainText(`Etest ${lastName}`);
    await row.getByRole('button', { name: 'Tahrirlash' }).click();
    const edit = page.getByRole('dialog');
    await expect(edit.getByRole('heading')).toHaveText(`Tahrirlash: Etest ${lastName}`);
    await expect(requiredField(page, 'Telefon raqam')).toHaveValue(phone);
    await requiredField(page, 'Ism').fill('Tahrirlandi');
    await edit.getByRole('button', { name: 'Saqlash' }).click();
    await expect(edit).toBeHidden();
    await expect(tableRow(page, phone)).toContainText(`Tahrirlandi ${lastName}`);

    await page.reload();
    await expect(tableRow(page, phone)).toContainText(`Tahrirlandi ${lastName}`);
  });

  test('(4b) telefon band — yaratishda ham, tahrirlashda ham telefon maydonida xato', async ({
    page,
    request,
    adminApi,
  }) => {
    const takenPhone = uniqueTestPhone();
    const otherPhone = uniqueTestPhone();
    const taken = await createMentorViaApi(request, adminApi.token, {
      phone: takenPhone,
      firstName: 'Band',
      lastName: uniqueName('Telefon'),
    });
    const otherLastName = uniqueName('Boshqa');
    const other = await createMentorViaApi(request, adminApi.token, {
      phone: otherPhone,
      firstName: 'Boshqa',
      lastName: otherLastName,
    });
    adminApi.track(taken.id, other.id);
    await loginToAdmin(page, e2eUsers().admin);
    await page.goto('/admin/mentors');

    // Yaratish: band telefon → 409 → telefon maydonida xato, oyna ochiq qoladi.
    await page.getByRole('button', { name: 'Yangi mentor' }).click();
    const dialog = page.getByRole('dialog');
    const phoneField = requiredField(page, 'Telefon raqam');
    await phoneField.fill(takenPhone);
    await requiredField(page, 'Ism').fill('Takror');
    await requiredField(page, 'Familiya').fill(uniqueName('Takror'));
    await dialog.getByRole('button', { name: 'Yaratish' }).click();
    await expect(phoneField).toHaveAttribute('aria-invalid', 'true');
    await expect(phoneField).toHaveAccessibleDescription(PHONE_TAKEN);
    await expect(dialog.getByRole('heading', { name: 'Yangi mentor' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Bekor qilish' }).click();

    // Tahrirlash: boshqa mentorga band telefon → telefon maydonida xato, o'zgarmaydi.
    await searchList(page, otherPhone);
    await tableRow(page, otherPhone).getByRole('button', { name: 'Tahrirlash' }).click();
    const edit = page.getByRole('dialog');
    await requiredField(page, 'Telefon raqam').fill(takenPhone);
    await edit.getByRole('button', { name: 'Saqlash' }).click();
    await expect(requiredField(page, 'Telefon raqam')).toHaveAccessibleDescription(PHONE_TAKEN);
    await expect(edit).toBeVisible();
    await edit.getByRole('button', { name: 'Bekor qilish' }).click();
    await expect(tableRow(page, otherPhone)).toContainText(`Boshqa ${otherLastName}`);
  });
});

test.describe("Adminlar bo'limi (/admin/admins)", () => {
  test('(5) super admin jadvalni ko\'radi, oddiy admin — "Ruxsat yo\'q"', async ({ browser }) => {
    const { admin, superAdmin } = e2eUsers();

    const superPage = await (await browser.newContext()).newPage();
    await loginToAdmin(superPage, superAdmin);
    await superPage.goto('/admin/admins');
    await expect(superPage.getByRole('heading', { name: 'Adminlar', level: 1 })).toBeVisible();
    await expect(superPage.getByRole('button', { name: 'Yangi admin' })).toBeVisible();
    await searchList(superPage, admin.login);
    await expect(tableRow(superPage, admin.login)).toContainText(
      `${admin.firstName} ${admin.lastName}`,
    );
    await expect(superPage.getByText("Ruxsat yo'q")).toHaveCount(0);

    const adminPage = await (await browser.newContext()).newPage();
    await loginToAdmin(adminPage, admin);
    await adminPage.goto('/admin/admins');
    await expect(adminPage.getByText("Ruxsat yo'q")).toBeVisible();
    await expect(adminPage.getByText("Bu bo'lim faqat super admin uchun.")).toBeVisible();
    await expect(adminPage.getByRole('heading', { name: 'Adminlar', level: 1 })).toHaveCount(0);
    await expect(adminPage.getByRole('button', { name: 'Yangi admin' })).toHaveCount(0);
  });
});
