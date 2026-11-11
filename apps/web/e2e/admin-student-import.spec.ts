import type { StudentImportResult } from '@lms/shared';

import { countStudents } from './support/admin-api';
import { createdResponse, expect, loginToAdmin, test, uniqueName } from './support/admin-fixtures';
import { e2eUsers } from './support/e2e-users';

import type { Locator, Page } from '@playwright/test';

const IMPORT_PATH = '/admin/students/import';

async function uploadCsv(page: Page, name: string, lines: readonly string[]): Promise<void> {
  await page.getByLabel('CSV fayl').setInputFiles({
    name,
    mimeType: 'text/csv',
    buffer: Buffer.from(`${lines.join('\n')}\n`, 'utf8'),
  });
  await page.getByRole('button', { name: 'Import qilish' }).click();
}

/** Import xatosi: umumiy xabar va xatolar jadvali. */
async function expectImportFailed(page: Page): Promise<void> {
  await expect(page.getByRole('alert').filter({ hasText: 'CSV faylda xatolar bor' })).toBeVisible();
  await expect(errorsTable(page)).toBeVisible();
}

function errorsTable(page: Page): Locator {
  return page.getByRole('region', { name: 'CSV xatolari' }).getByRole('table');
}

function errorRow(page: Page, field: string): Locator {
  return errorsTable(page).getByRole('row').filter({ hasText: field });
}

test.describe('Admin: studentlarni CSV import', () => {
  test.beforeEach(async ({ page }) => {
    await loginToAdmin(page, e2eUsers().admin);
    await page.goto(IMPORT_PATH);
    await expect(page.getByRole('heading', { name: /CSV orqali import/, level: 1 })).toBeVisible();
  });

  test("(3a) to'g'ri fayl — yaratilgan studentlar va vaqtinchalik parollar ko'rsatiladi", async ({
    page,
    request,
    adminApi,
  }) => {
    const family = uniqueName('Import');
    const created = createdResponse<StudentImportResult>(page, IMPORT_PATH);
    await uploadCsv(page, 'students.csv', [
      'firstName,lastName,groupName',
      `Ali,${family}a,`,
      `Laylo,"${family}b, Sh.",`,
    ]);
    const result = await created;
    adminApi.track(...result.students.map((student) => student.id));

    expect(result.count).toBe(2);
    await expect(page.getByText('2 ta student yaratildi.')).toBeVisible();
    const table = page.getByRole('region', { name: 'Yaratilgan studentlar' }).getByRole('table');
    for (const student of result.students) {
      const row = table.getByRole('row').filter({ hasText: student.studentCode });
      await expect(row).toContainText(`${student.firstName} ${student.lastName}`);
      await expect(row).toContainText(student.temporaryPassword);
    }
    await expect(table).toContainText(`Ali ${family}a`);
    await expect(table).toContainText(`Laylo ${family}b, Sh.`);
    expect(await countStudents(request, adminApi.token, family)).toBe(2);

    await page.getByRole('button', { name: 'Yangi import' }).click();
    await expect(page.getByRole('button', { name: 'Import qilish' })).toBeVisible();
    await expect(page.getByText(result.students[0]?.temporaryPassword ?? '-')).toHaveCount(0);
  });

  test("(3b) qator xatolari — qatorlar bo'yicha xatolar jadvali, hech kim yaratilmaydi", async ({
    page,
    request,
    adminApi,
  }) => {
    const family = uniqueName('Xato');
    await uploadCsv(page, 'broken-rows.csv', [
      'firstName,lastName',
      `Ali,${family}`,
      'Vali,',
      `,${family}d`,
    ]);

    await expectImportFailed(page);
    await expect(errorRow(page, 'lastName').getByRole('cell').first()).toHaveText('3');
    await expect(errorRow(page, 'firstName').getByRole('cell').first()).toHaveText('4');
    expect(await countStudents(request, adminApi.token, family)).toBe(0);
  });

  test('(3c) topilmagan guruh nomi — groupName qatori xatosi, hech kim yaratilmaydi', async ({
    page,
    request,
    adminApi,
  }) => {
    const family = uniqueName('Guruhsiz');
    await uploadCsv(page, 'broken-group.csv', [
      'firstName,lastName,groupName',
      `Ali,${family},`,
      `Sardor,${family}c,${uniqueName('YoqGuruh')}`,
    ]);

    await expectImportFailed(page);
    const groupError = errorRow(page, 'groupName');
    await expect(groupError.getByRole('cell').first()).toHaveText('3');
    await expect(groupError).toContainText('Bunday nomli faol guruh topilmadi');
    expect(await countStudents(request, adminApi.token, family)).toBe(0);
  });
});
