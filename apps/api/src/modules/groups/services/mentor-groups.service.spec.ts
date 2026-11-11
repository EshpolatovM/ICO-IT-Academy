import { ErrorCode, GroupStatus, UserStatus } from '@lms/shared';

import { MentorGroupsService } from './mentor-groups.service.js';

import type { MentorGroupsRepository } from '../repositories/mentor-groups.repository.js';

const GROUP = {
  id: 'g1',
  name: 'FE-12',
  status: GroupStatus.ACTIVE,
  startsAt: null,
  path: { id: 'p1', title: 'Frontend' },
  studentsCount: 2,
};
const STUDENT = {
  id: 's1',
  studentCode: 'ST-10001',
  firstName: 'Ali',
  lastName: 'V',
  status: UserStatus.ACTIVE,
  lastLoginAt: new Date('2026-11-10T06:00:00.000Z'),
};

function setup(group: typeof GROUP | null = GROUP, profile: object | null = null) {
  const repository = {
    listForMentor: jest.fn().mockResolvedValue([GROUP]),
    findForMentor: jest.fn().mockResolvedValue(group),
    listStudents: jest.fn().mockResolvedValue([STUDENT]),
    findStudentProfile: jest.fn().mockResolvedValue(profile),
  };
  const service = new MentorGroupsService(repository as unknown as MentorGroupsRepository);
  return { service, repository };
}

describe('MentorGroupsService', () => {
  it("o'z guruhlari va guruh studentlari", async () => {
    const { service, repository } = setup();

    await expect(service.list('m1')).resolves.toEqual({ items: [GROUP] });
    await expect(service.students('g1', 'm1')).resolves.toEqual({
      items: [{ ...STUDENT, lastLoginAt: '2026-11-10T06:00:00.000Z' }],
    });
    expect(repository.findForMentor).toHaveBeenCalledWith('g1', 'm1');
  });

  it("begona (yoki arxivlangan) guruh — 404, studentlar o'qilmaydi", async () => {
    const { service, repository } = setup(null);

    await expect(service.get('g1', 'm1')).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    await expect(service.students('g1', 'm1')).rejects.toMatchObject({ status: 404 });
    expect(repository.listStudents).not.toHaveBeenCalled();
  });

  it('student profili: guruh va tokenlar soni; topilmasa — 404', async () => {
    const profile = { ...STUDENT, group: { id: 'g1', name: 'FE-12' }, parentTokensCount: 2 };

    await expect(setup(GROUP, profile).service.studentProfile('s1')).resolves.toMatchObject({
      group: { name: 'FE-12' },
      parentTokensCount: 2,
      lastLoginAt: '2026-11-10T06:00:00.000Z',
    });
    await expect(setup().service.studentProfile('s1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });
});
