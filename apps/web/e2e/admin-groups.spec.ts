import { GroupStatus } from '@lms/shared';
import type { AdminGroupDetail, CreatedStudentResponse } from '@lms/shared';

import { createMentorViaApi, createStudentViaApi } from './support/admin-api';
import {
  confirmInDialog,
  createdResponse,
  expect,
  loginToAdmin,
  searchList,
  tableRow,
  test,
  uniqueGroupName,
  uniqueName,
  uniqueTestPhone,
} from './support/admin-fixtures';
import { expectPath, requiredField } from './support/auth';
import { e2eUsers } from './support/e2e-users';
import {
  addMembersViaApi,
  createGroupViaApi,
  firstPathId,
  getGroupViaApi,
  setGroupStatusViaApi,
} from './support/groups-api';

import type { AdminApi } from './support/admin-fixtures';
import type { APIRequestContext, Locator, Page } from '@playwright/test';

const GROUPS_PATH = '/admin/groups';
const STUDENT_FIRST_NAME = 'Etest';
const ADD_FIELD = "Student qo'shish";

/** Combobox'ga qidiruv matnini yozib, shu matnli variantni tanlaydi. */
async function pickOption(combobox: Locator, page: Page, text: string): Promise<void> {
  await combobox.fill(text);
  await page.getByRole('option').filter({ hasText: text }).click();
}

/** Test studenti (API orqali, guruhsiz) — teardown ro'yxatiga qo'shiladi. */
async function newStudent(
  request: APIRequestContext,
  adminApi: AdminApi,
  prefix: string,
): Promise<CreatedStudentResponse & { lastName: string }> {
  const lastName = uniqueName(prefix);
  const student = await createStudentViaApi(request, adminApi.token, {
    firstName: STUDENT_FIRST_NAME,
    lastName,
  });
  adminApi.track(student.id);
  return { ...student, lastName };
}

/** "Yangi guruh" oynasi: nom va yo'l (sana bo'sh, mentorsiz) → tafsilot sahifasiga o'tiladi. */
async function createGroupViaUi(page: Page, name: string, pathId: string): Promise<string> {
  await page.getByRole('button', { name: 'Yangi guruh' }).click();
  const dialog = page.getByRole('dialog');
  await requiredField(page, 'Nom').fill(name);
  await dialog.getByRole('combobox', { name: "Yo'l (majburiy)" }).selectOption(pathId);
  const created = createdResponse<AdminGroupDetail>(page, GROUPS_PATH);
  await dialog.getByRole('button', { name: 'Yaratish' }).click();
  const group = await created;
  expect(group.startsAt).toBeNull();
  expect(group.mentor).toBeNull();
  await expectPath(page, `${GROUPS_PATH}/${group.id}`);
  return group.id;
}

/**
 * "Qo'shish": multiple Combobox tanlovdan keyin ro'yxatni ochiq qoldiradi va u tugmani yopib
 * turadi, shuning uchun avval Esc bilan yopiladi (foydalanuvchi ham shunday qiladi).
 */
async function submitMembers(page: Page): Promise<void> {
  await page.getByRole('combobox', { name: ADD_FIELD }).press('Escape');
  await expect(page.getByRole('listbox', { name: 'Studentlar' })).toHaveCount(0);
  await page.getByRole('button', { name: "Qo'shish" }).click();
}

function membersTable(page: Page): Locator {
  return page.getByRole('region', { name: "A'zolar" }).getByRole('table');
}

test.describe('Admin: guruhlar', () => {
  test.beforeEach(async ({ page }) => {
    await loginToAdmin(page, e2eUsers().admin);
  });

  test("(g1) yaratish → mentor biriktirish/olib tashlash → 2 student qo'shish → birini chiqarish", async ({
    page,
    request,
    adminApi,
  }) => {
    const pathId = await firstPathId(request, adminApi.token);
    const mentorLastName = uniqueName('Mentor');
    const mentor = await createMentorViaApi(request, adminApi.token, {
      firstName: 'Etest',
      lastName: mentorLastName,
      phone: uniqueTestPhone(),
    });
    adminApi.track(mentor.id);
    const first = await newStudent(request, adminApi, 'Birinchi');
    const second = await newStudent(request, adminApi, 'Ikkinchi');
    const name = uniqueGroupName('Guruh');

    await page.goto(GROUPS_PATH);
    await expect(page.getByRole('heading', { name: 'Guruhlar', level: 1 })).toBeVisible();
    const groupId = await createGroupViaUi(page, name, pathId);
    adminApi.trackGroups(groupId);
    await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
    await expect(page.getByText("Guruhda hali student yo'q")).toBeVisible();

    // Mentor biriktirish va olib tashlash
    const mentorField = page.getByRole('combobox', { name: 'Mentor' });
    await pickOption(mentorField, page, mentorLastName);
    await page.getByRole('button', { name: 'Biriktirish' }).click();
    await expect(page.getByRole('button', { name: 'Olib tashlash' })).toBeVisible();
    await expect(page.getByText(`Etest ${mentorLastName}`).first()).toBeVisible();
    expect((await getGroupViaApi(request, adminApi.token, groupId)).mentor?.id).toBe(mentor.id);

    await page.getByRole('button', { name: 'Olib tashlash' }).click();
    await expect(page.getByRole('button', { name: 'Olib tashlash' })).toHaveCount(0);
    expect((await getGroupViaApi(request, adminApi.token, groupId)).mentor).toBeNull();

    // Ikki studentni bir martada qo'shish (multiple Combobox)
    const addField = page.getByRole('combobox', { name: ADD_FIELD });
    await pickOption(addField, page, first.lastName);
    await pickOption(addField, page, second.lastName);
    await submitMembers(page);
    await expect(membersTable(page).getByRole('row')).toHaveCount(3);
    await expect(tableRow(page, first.studentCode)).toContainText(first.lastName);
    await expect(tableRow(page, second.studentCode)).toContainText(second.lastName);
    await expect(page.getByText("A'zolar (2)")).toBeVisible();

    // Birini chiqarish
    await page
      .getByRole('button', { name: `${STUDENT_FIRST_NAME} ${first.lastName} — chiqarish` })
      .click();
    await confirmInDialog(page, 'Chiqarish');
    await expect(tableRow(page, first.studentCode)).toHaveCount(0);
    await expect(tableRow(page, second.studentCode)).toBeVisible();
    await expect(page.getByText("A'zolar (1)")).toBeVisible();
    const members = (await getGroupViaApi(request, adminApi.token, groupId)).members;
    expect(members.map((member) => member.id)).toEqual([second.id]);
  });

  test('(g2) boshqa faol guruhdagi student — "Allaqachon boshqa faol guruhda: <ism>"', async ({
    page,
    request,
    adminApi,
  }) => {
    const pathId = await firstPathId(request, adminApi.token);
    const busy = await newStudent(request, adminApi, 'Band');
    const other = await createGroupViaApi(request, adminApi.token, {
      name: uniqueGroupName('Boshqa'),
      pathId,
    });
    const target = await createGroupViaApi(request, adminApi.token, {
      name: uniqueGroupName('Nishon'),
      pathId,
    });
    adminApi.trackGroups(other.id, target.id);
    await addMembersViaApi(request, adminApi.token, other.id, [busy.id]);

    await page.goto(`${GROUPS_PATH}/${target.id}`);
    await pickOption(page.getByRole('combobox', { name: ADD_FIELD }), page, busy.lastName);
    await submitMembers(page);

    await expect(
      page.getByText(`Allaqachon boshqa faol guruhda: ${STUDENT_FIRST_NAME} ${busy.lastName}`),
    ).toBeVisible();
    expect((await getGroupViaApi(request, adminApi.token, target.id)).members).toHaveLength(0);
  });

  test("(g3) arxivlash → qo'shish disabled → qayta faollashtirish", async ({
    page,
    request,
    adminApi,
  }) => {
    const pathId = await firstPathId(request, adminApi.token);
    const group = await createGroupViaApi(request, adminApi.token, {
      name: uniqueGroupName('Arxiv'),
      pathId,
    });
    adminApi.trackGroups(group.id);
    await page.goto(`${GROUPS_PATH}/${group.id}`);
    const header = page.getByRole('heading', { name: group.name, level: 1 });
    await expect(header).toBeVisible();

    await page.getByRole('button', { name: 'Arxivlash' }).click();
    await expect(page.getByRole('alertdialog')).toContainText('arxivlansinmi?');
    await confirmInDialog(page, 'Arxivlash');
    await expect(page.getByRole('button', { name: 'Qayta faollashtirish' })).toBeVisible();
    await expect(page.getByText('Arxivlangan').first()).toBeVisible();
    await expect(page.getByRole('combobox', { name: ADD_FIELD })).toBeDisabled();
    await expect(page.getByRole('button', { name: "Qo'shish" })).toBeDisabled();
    await expect(page.getByText("Arxivlangan guruhga qo'shib bo'lmaydi")).toBeVisible();
    expect((await getGroupViaApi(request, adminApi.token, group.id)).status).toBe(
      GroupStatus.ARCHIVED,
    );

    await page.getByRole('button', { name: 'Qayta faollashtirish' }).click();
    await expect(page.getByRole('alertdialog')).toContainText('faollashtirilsinmi?');
    await confirmInDialog(page, 'Faollashtirish');
    await expect(page.getByRole('button', { name: 'Arxivlash' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: ADD_FIELD })).toBeEnabled();
    expect((await getGroupViaApi(request, adminApi.token, group.id)).status).toBe(
      GroupStatus.ACTIVE,
    );
  });

  test("(g4) ro'yxat: nom bo'yicha qidiruv va holat filtri", async ({
    page,
    request,
    adminApi,
  }) => {
    const pathId = await firstPathId(request, adminApi.token);
    const prefix = uniqueGroupName('Filtr');
    const active = await createGroupViaApi(request, adminApi.token, {
      name: `${prefix}-faol`,
      pathId,
    });
    const archived = await createGroupViaApi(request, adminApi.token, {
      name: `${prefix}-arxiv`,
      pathId,
    });
    adminApi.trackGroups(active.id, archived.id);
    await setGroupStatusViaApi(request, adminApi.token, archived.id, GroupStatus.ARCHIVED);

    await page.goto(GROUPS_PATH);
    await searchList(page, prefix.toUpperCase());
    await expect(tableRow(page, prefix)).toHaveCount(2);

    const status = page.getByRole('combobox', { name: 'Holat' });
    await status.selectOption(GroupStatus.ARCHIVED);
    await expect.poll(() => new URL(page.url()).searchParams.get('status')).toBe('ARCHIVED');
    await expect(tableRow(page, prefix)).toHaveCount(1);
    await expect(tableRow(page, archived.name)).toContainText('Arxivlangan');

    await status.selectOption(GroupStatus.ACTIVE);
    await expect(tableRow(page, prefix)).toHaveCount(1);
    await expect(tableRow(page, active.name)).toContainText('Faol');

    await page.getByRole('link', { name: active.name }).click();
    await expectPath(page, `${GROUPS_PATH}/${active.id}`);
  });
});
