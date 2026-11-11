import { ErrorCode } from '@lms/shared';
import type { GroupRef } from '@lms/shared';

import { GroupEnrollmentService } from './group-enrollment.service.js';

import type { GroupMembersRepository } from '../repositories/group-members.repository.js';
import type { GroupsRepository } from '../repositories/groups.repository.js';

interface SetupOptions {
  group?: GroupRef | null;
  added?: boolean;
}

function setup({ group = { id: 'g1', name: 'FE' }, added = true }: SetupOptions = {}) {
  const groups = {
    findActiveRef: jest.fn().mockResolvedValue(group),
    findActiveRefsByNames: jest.fn().mockResolvedValue([]),
  };
  const members = {
    addActive: jest.fn().mockResolvedValue(added),
    addActiveMany: jest.fn().mockResolvedValue(undefined),
  };
  const service = new GroupEnrollmentService(
    groups as unknown as GroupsRepository,
    members as unknown as GroupMembersRepository,
  );
  return { service, members };
}

describe('GroupEnrollmentService', () => {
  it('faol guruh qaytadi; topilmasa — 400 maydon nomi bilan', async () => {
    await expect(setup().service.requireActiveGroup('g1', 'groupId')).resolves.toEqual({
      id: 'g1',
      name: 'FE',
    });
    await expect(
      setup({ group: null }).service.requireActiveGroup('g1', 'groupId'),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'groupId', message: expect.any(String) as string }],
    });
  });

  it('ikkinchi faol guruh — 409 STUDENT_ALREADY_IN_GROUP', async () => {
    const { service } = setup({ added: false });

    await expect(service.enroll({ groupId: 'g1', studentId: 's1' })).rejects.toMatchObject({
      code: ErrorCode.STUDENT_ALREADY_IN_GROUP,
      status: 409,
    });
  });

  it("muvaffaqiyatli a'zolik va ommaviy qo'shish", async () => {
    const { service, members } = setup();

    await service.enroll({ groupId: 'g1', studentId: 's1' });
    await service.enrollNewStudents([{ groupId: 'g1', studentId: 's2' }]);

    expect(members.addActive).toHaveBeenCalledWith({ groupId: 'g1', studentId: 's1' });
    expect(members.addActiveMany).toHaveBeenCalledWith([{ groupId: 'g1', studentId: 's2' }]);
  });
});
