import { Logger } from '@nestjs/common';

import { ErrorCode } from '@lms/shared';
import type { GroupRef } from '@lms/shared';

import { GroupEnrollmentService } from './group-enrollment.service.js';

import type { MentorScopeCache } from './mentor-scope-cache.service.js';
import type { GroupMembersRepository } from '../repositories/group-members.repository.js';
import type { GroupsRepository } from '../repositories/groups.repository.js';

interface SetupOptions {
  group?: GroupRef | null;
  added?: boolean;
}

function setup({ group = { id: 'g1', name: 'FE' }, added = true }: SetupOptions = {}) {
  const groups = {
    lockForUpdate: jest.fn().mockResolvedValue(undefined),
    lockManyForUpdate: jest.fn().mockResolvedValue(undefined),
    findActiveRefs: jest.fn().mockResolvedValue([]),
    findActiveRef: jest.fn().mockResolvedValue(group),
    findActiveRefsByNames: jest.fn().mockResolvedValue([]),
    findMentorIds: jest.fn().mockResolvedValue(['m1']),
  };
  const members = {
    addActive: jest.fn().mockResolvedValue(added),
    addActiveMany: jest.fn().mockResolvedValue(undefined),
  };
  const scopeCache = { invalidate: jest.fn().mockResolvedValue(undefined) };
  const service = new GroupEnrollmentService(
    groups as unknown as GroupsRepository,
    members as unknown as GroupMembersRepository,
    scopeCache as unknown as MentorScopeCache,
  );
  return { service, members, groups, scopeCache };
}

describe('GroupEnrollmentService', () => {
  it('faol guruh qaytadi (qator qulflanadi); topilmasa — 400 maydon nomi bilan', async () => {
    const { service, groups } = setup();
    await service.requireActiveGroup('g1', 'groupId');
    expect(groups.lockForUpdate).toHaveBeenCalledWith('g1');

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

  it("requireGroupsStillActive: takrorsiz qulflab, hammasi faol — xato yo'q", async () => {
    const { service, groups } = setup();
    const fe = { id: 'g1', name: 'FE' };
    const be = { id: 'g2', name: 'BE' };
    groups.findActiveRefs.mockResolvedValue([be, fe]);

    await service.requireGroupsStillActive([fe, be, fe]);

    expect(groups.lockManyForUpdate).toHaveBeenCalledWith(['g1', 'g2']);
    expect(groups.findActiveRefs).toHaveBeenCalledWith(['g1', 'g2']);
    expect(groups.lockManyForUpdate.mock.invocationCallOrder[0]).toBeLessThan(
      groups.findActiveRefs.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("requireGroupsStillActive: qulfdan keyin faol bo'lmagan guruh — 409 GROUP_ARCHIVED (details.groups)", async () => {
    const { service, groups } = setup();
    const fe = { id: 'g1', name: 'FE' };
    const be = { id: 'g2', name: 'BE' };
    groups.findActiveRefs.mockResolvedValue([fe]);

    await expect(service.requireGroupsStillActive([fe, be, be])).rejects.toMatchObject({
      code: ErrorCode.GROUP_ARCHIVED,
      status: 409,
      details: { groups: [be] },
    });
  });

  it("requireGroupsStillActive: guruhsiz import — so'rov yo'q", async () => {
    const { service, groups } = setup();

    await service.requireGroupsStillActive([]);

    expect(groups.lockManyForUpdate).not.toHaveBeenCalled();
    expect(groups.findActiveRefs).not.toHaveBeenCalled();
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

  it("refreshMentorScopes: guruhlar mentorlari keshi o'chiriladi; bo'sh ro'yxat — hech narsa", async () => {
    const { service, groups, scopeCache } = setup();

    await service.refreshMentorScopes([]);
    expect(groups.findMentorIds).not.toHaveBeenCalled();

    await service.refreshMentorScopes(['g1', 'g2']);
    expect(groups.findMentorIds).toHaveBeenCalledWith(['g1', 'g2']);
    expect(scopeCache.invalidate).toHaveBeenCalledWith('m1');
  });

  it("refreshMentorScopes: bazadan o'qib bo'lmasa — xato tashlamaydi, error log", async () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { service, groups, scopeCache } = setup();
    groups.findMentorIds.mockRejectedValueOnce(new Error('db down'));

    await expect(service.refreshMentorScopes(['g1'])).resolves.toBeUndefined();
    expect(scopeCache.invalidate).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('g1'));
    error.mockRestore();
  });
});
