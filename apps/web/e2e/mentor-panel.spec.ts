import type { AdminGroupDetail, CreatedStudentResponse } from '@lms/shared';

import { createMentorViaApi, createStudentViaApi, studentLoginStatus } from './support/admin-api';
import {
  confirmInDialog,
  expect,
  secretValue,
  test,
  uniqueGroupName,
  uniqueName,
  uniqueTestPhone,
} from './support/admin-fixtures';
import { expectPath, loginAsStaff, requiredField } from './support/auth';
import {
  activateStaffViaApi,
  addMembersViaApi,
  createGroupViaApi,
  firstPathId,
} from './support/groups-api';

import type { AdminApi } from './support/admin-fixtures';
import type { APIRequestContext, Browser, Page } from '@playwright/test';

const FIRST_NAME = 'Etest';
const MENTOR_PASSWORD = 'Mentor$Parol9';
const TOKEN_LABEL = 'Onasi';
const PARENT_CARD = 'parent-child-card';

interface Scenario {
  mentorPhone: string;
  ownGroup: AdminGroupDetail;
  foreignGroup: AdminGroupDetail;
  student: CreatedStudentResponse & { lastName: string };
  foreignStudent: CreatedStudentResponse;
}

async function newMentor(request: APIRequestContext, adminApi: AdminApi, phone: string) {
  const mentor = await createMentorViaApi(request, adminApi.token, {
    firstName: FIRST_NAME,
    lastName: uniqueName('Mentor'),
    phone,
  });
  adminApi.track(mentor.id);
  return mentor;
}

async function newStudent(request: APIRequestContext, adminApi: AdminApi, prefix: string) {
  const lastName = uniqueName(prefix);
  const student = await createStudentViaApi(request, adminApi.token, {
    firstName: FIRST_NAME,
    lastName,
  });
  adminApi.track(student.id);
  return { ...student, lastName };
}

/**
 * Admin API orqali: o'z mentori (paroli almashtirilgan) + guruhi + studenti, va boshqa mentorning
 * guruhi + studenti (scope tekshiruvi uchun).
 */
async function prepareScenario(request: APIRequestContext, adminApi: AdminApi): Promise<Scenario> {
  const pathId = await firstPathId(request, adminApi.token);
  const mentorPhone = uniqueTestPhone();
  const mentor = await newMentor(request, adminApi, mentorPhone);
  await activateStaffViaApi(request, mentorPhone, mentor.temporaryPassword ?? '', MENTOR_PASSWORD);
  const otherMentor = await newMentor(request, adminApi, uniqueTestPhone());
  const student = await newStudent(request, adminApi, 'Shogird');
  const foreignStudent = await newStudent(request, adminApi, 'Begona');

  const ownGroup = await createGroupViaApi(request, adminApi.token, {
    name: uniqueGroupName('Mentorniki'),
    pathId,
    mentorId: mentor.id,
  });
  const foreignGroup = await createGroupViaApi(request, adminApi.token, {
    name: uniqueGroupName('Begona'),
    pathId,
    mentorId: otherMentor.id,
  });
  adminApi.trackGroups(ownGroup.id, foreignGroup.id);
  await addMembersViaApi(request, adminApi.token, ownGroup.id, [student.id]);
  await addMembersViaApi(request, adminApi.token, foreignGroup.id, [foreignStudent.id]);
  return { mentorPhone, ownGroup, foreignGroup, student, foreignStudent };
}

/** Ota-ona havolasini yangi (toza) brauzer kontekstida ochadi. */
async function openParentLink(browser: Browser, link: string): Promise<Page> {
  const url = new URL(link);
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${url.pathname}${url.hash}`);
  await expectPath(page, '/parent');
  return page;
}

/** Parolni tiklash: yangi parol bir marta ko'rinadi, oyna yopilgach sahifada qolmaydi. */
async function resetPasswordOnce(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Parolni tiklash' }).click();
  await confirmInDialog(page, 'Tiklash');
  const result = page.getByRole('dialog').filter({ hasText: 'Parol tiklandi' });
  const password = (await secretValue(result, 'Vaqtinchalik parol').textContent()) ?? '';
  expect(password).not.toBe('');
  await result.getByRole('button', { name: 'Tayyor' }).click();
  await expect(result).toBeHidden();
  await expect(page.getByText(password)).toHaveCount(0);
  return password;
}

/** Ota-ona havolasini yaratish: havola bir marta ko'rinadi, oyna yopilgach sahifada qolmaydi. */
async function createParentLinkOnce(page: Page): Promise<string> {
  await page.getByLabel(/Yorliq/).fill(TOKEN_LABEL);
  await page.getByRole('button', { name: 'Havola yaratish' }).click();
  const result = page.getByRole('dialog').filter({ hasText: 'Ota-ona havolasi yaratildi' });
  const link = (await secretValue(result, 'Ota-ona havolasi').textContent()) ?? '';
  expect(new URL(link).hash).toMatch(/^#t=/);
  await result.getByRole('button', { name: 'Tayyor' }).click();
  await expect(result).toBeHidden();
  await expect(page.getByText(link)).toHaveCount(0);
  return link;
}

test.describe('Mentor paneli', () => {
  test("(m1) o'z guruhi → student profili → parol tiklash → ota-ona havolasi → bekor qilish; begona — topilmadi", async ({
    page,
    browser,
    request,
    adminApi,
  }) => {
    const { mentorPhone, ownGroup, foreignGroup, student, foreignStudent } = await prepareScenario(
      request,
      adminApi,
    );
    const studentName = `${FIRST_NAME} ${student.lastName}`;
    await loginAsStaff(
      page,
      { id: '', login: mentorPhone, firstName: '', lastName: '' },
      MENTOR_PASSWORD,
    );
    await expectPath(page, '/mentor');

    // Guruhlar: faqat o'ziniki
    await page.goto('/mentor/groups');
    await expect(page.getByRole('link', { name: ownGroup.name })).toBeVisible();
    await expect(page.getByText(foreignGroup.name)).toHaveCount(0);

    // Guruh tafsiloti → student profili
    await page.getByRole('link', { name: ownGroup.name }).click();
    await expectPath(page, `/mentor/groups/${ownGroup.id}`);
    await expect(page.getByRole('heading', { name: ownGroup.name, level: 1 })).toBeVisible();
    await page.getByRole('link', { name: student.studentCode }).click();
    await expectPath(page, `/mentor/students/${student.id}`);
    await expect(page.getByRole('heading', { name: studentName, level: 1 })).toBeVisible();

    // Parolni tiklash → yangi parol bilan student kira oladi
    const newPassword = await resetPasswordOnce(page);
    expect(await studentLoginStatus(request, student.studentCode, newPassword)).toBe(200);

    // Ota-ona havolasi: farzand groupName bilan ko'rinadi
    const link = await createParentLinkOnce(page);
    const parentPage = await openParentLink(browser, link);
    const card = parentPage.getByTestId(PARENT_CARD);
    await expect(card).toContainText(studentName);
    await expect(card).toContainText(`Guruh: ${ownGroup.name}`);

    // Bekor qilish → joriy ota-ona sessiyasi ham, havola ham endi ishlamaydi
    await page.getByRole('button', { name: `${TOKEN_LABEL} — bekor qilish` }).click();
    await confirmInDialog(page, 'Tokenni bekor qilish');
    await expect(page.getByText("Faol ota-ona havolasi yo'q")).toBeVisible();

    await parentPage.reload();
    await expect(requiredField(parentPage, 'Kirish kodi')).toBeVisible();
    await expect(parentPage.getByTestId(PARENT_CARD)).toHaveCount(0);

    const retryPage = await openParentLink(browser, link);
    await expect(requiredField(retryPage, 'Kirish kodi')).toBeVisible();
    await expect(retryPage.getByRole('alert').first()).toBeVisible();
    await expect(retryPage.getByTestId(PARENT_CARD)).toHaveCount(0);

    // Begona student va begona guruh — "topilmadi"
    await page.goto(`/mentor/students/${foreignStudent.id}`);
    await expect(page.getByText('Student topilmadi')).toBeVisible();
    await page.goto(`/mentor/groups/${foreignGroup.id}`);
    await expect(page.getByText('Guruh topilmadi')).toBeVisible();
  });
});
