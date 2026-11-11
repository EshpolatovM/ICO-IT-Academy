import { ErrorCode, UserStatus } from '@lms/shared';

import { groupRecord } from '../testing/groups.fixtures.js';

import { GroupDetailsService } from './group-details.service.js';
import { LearningPathsService } from './learning-paths.service.js';

import type { GroupMembersRepository } from '../repositories/group-members.repository.js';
import type { GroupsRepository } from '../repositories/groups.repository.js';
import type { LearningPathsRepository } from '../repositories/learning-paths.repository.js';

const MEMBER = {
  id: 's1',
  studentCode: 'ST-10001',
  firstName: 'Ali',
  lastName: 'V',
  status: UserStatus.ACTIVE,
  joinedAt: new Date('2026-11-11T08:00:00.000Z'),
};

function setup(found = true) {
  const record = found ? groupRecord() : null;
  const groups = {
    findRecord: jest.fn().mockResolvedValue(record),
    lockRecord: jest.fn().mockResolvedValue(record),
  };
  const members = { listActiveMembers: jest.fn().mockResolvedValue([MEMBER]) };
  return new GroupDetailsService(
    groups as unknown as GroupsRepository,
    members as unknown as GroupMembersRepository,
  );
}

describe('GroupDetailsService', () => {
  it("tafsilot faol a'zolar bilan (vaqtlar ISO, sana YYYY-MM-DD)", async () => {
    await expect(setup().detail('g1')).resolves.toMatchObject({
      id: 'g1',
      startsAt: '2026-11-15',
      createdAt: '2026-11-01T08:00:00.000Z',
      members: [{ id: 's1', studentCode: 'ST-10001', joinedAt: '2026-11-11T08:00:00.000Z' }],
    });
  });

  it("guruh yo'q yoki o'chirilgan — 404", async () => {
    await expect(setup(false).requireGroup('g1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    await expect(setup(false).requireLockedGroup('g1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it('requireLockedGroup — qulflangan qatordan yozuv', async () => {
    await expect(setup().requireLockedGroup('g1')).resolves.toMatchObject({ id: 'g1' });
  });
});

describe('LearningPathsService', () => {
  it("yo'llar ro'yxati: id, title, slug, status", async () => {
    const path = { id: 'p1', title: 'Frontend', slug: 'frontend', status: 'PUBLISHED' };
    const repository = { listRefs: jest.fn().mockResolvedValue([path]) };
    const service = new LearningPathsService(repository as unknown as LearningPathsRepository);

    await expect(service.list()).resolves.toEqual({ items: [path] });
  });
});
