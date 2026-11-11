import { ErrorCode, Role, UserSort, UserStatus } from '@lms/shared';

import { accountRecord, actorOf, CREATED_AT } from '../testing/admin-users.fixtures.js';

import { MentorAccountsService } from './mentor-accounts.service.js';
import { StudentAccountsService } from './student-accounts.service.js';

import type { AccountUpdateService } from './account-update.service.js';
import type { StaffAccountCreator } from './staff-account-creator.service.js';
import type { StudentAccountCreator } from './student-account-creator.service.js';
import type { UserAccountsRepository } from '../repositories/user-accounts.repository.js';
import type { UserSearchRepository } from '../repositories/user-search.repository.js';

const GROUP = { id: 'g1', name: 'FE-12' };

function setup(found = accountRecord(Role.STUDENT, { activeGroup: GROUP })) {
  const accounts = {
    findAccount: jest.fn().mockResolvedValue(found),
    findAccountsByIds: jest.fn().mockResolvedValue([found]),
  };
  const search = { search: jest.fn().mockResolvedValue({ ids: [found.id], total: 41 }) };
  const updater = { update: jest.fn().mockResolvedValue(undefined) };
  const deps = [
    accounts as unknown as UserAccountsRepository,
    search as unknown as UserSearchRepository,
    updater as unknown as AccountUpdateService,
  ] as const;
  const students = new StudentAccountsService(...deps, {} as StudentAccountCreator);
  const mentors = new MentorAccountsService(...deps, {} as StaffAccountCreator);
  return { students, mentors, accounts, search, updater };
}

const query = { q: 'st-10001', sort: UserSort.CREATED_AT_DESC, page: 3, pageSize: 20 };

describe('ManagedAccountsService (student)', () => {
  it("ro'yxat: qidiruv sharti, id'lar tartibida yozuvlar, pagination", async () => {
    const { students, search, accounts } = setup();

    const result = await students.list({ ...query, groupId: 'g1', status: UserStatus.ACTIVE });

    expect(search.search).toHaveBeenCalledWith({
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      groupId: 'g1',
      search: { namePattern: '%st-10001%', studentCode: 'ST-10001', phonePattern: null },
      sort: UserSort.CREATED_AT_DESC,
      page: 3,
      pageSize: 20,
    });
    expect(accounts.findAccountsByIds).toHaveBeenCalledWith(['u1']);
    expect(result).toEqual({
      items: [
        {
          id: 'u1',
          studentCode: 'ST-10001',
          firstName: 'Ali',
          lastName: 'Valiyev',
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          lastLoginAt: null,
          createdAt: CREATED_AT.toISOString(),
          group: GROUP,
        },
      ],
      total: 41,
      page: 3,
      pageSize: 20,
    });
  });

  it('boshqa rol yoki topilmagan akkaunt — 404 (SUPER_ADMIN ham)', async () => {
    await expect(setup(accountRecord(Role.MENTOR)).students.get('u1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    await expect(setup(accountRecord(Role.SUPER_ADMIN)).mentors.get('u1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it("o'z akkauntini o'zgartirish — 403, hech narsa o'qilmaydi", async () => {
    const { mentors, accounts, updater } = setup(accountRecord(Role.MENTOR));

    await expect(
      mentors.update('me', { status: UserStatus.INACTIVE }, actorOf(Role.ADMIN, 'me')),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
    expect(accounts.findAccount).not.toHaveBeenCalled();
    expect(updater.update).not.toHaveBeenCalled();
  });

  it('update: nishon yozuvi bilan updater chaqiriladi va yangilangan tafsilot qaytadi', async () => {
    const record = accountRecord(Role.MENTOR, { mentoredGroups: [GROUP] });
    const { mentors, updater } = setup(record);
    const actor = actorOf(Role.ADMIN);

    const result = await mentors.update('u1', { lastName: 'Yangi' }, actor);

    expect(updater.update).toHaveBeenCalledWith(record, { lastName: 'Yangi' }, actor);
    expect(result).toMatchObject({ id: 'u1', phone: '+998900000001', groups: [GROUP], bio: null });
  });
});
