import { GroupMembersRepository } from './group-members.repository.js';

import type { PrismaService } from '../../../infra/prisma/prisma.service.js';

const G = 'g1';
const S_A = '0190a000-0000-7000-8000-00000000000a';
const S_B = '0190b000-0000-7000-8000-00000000000b';
const S_C = '0190c000-0000-7000-8000-00000000000c';

function setup(insertedStudentIds: string[] = []) {
  const groupMember = {
    createManyAndReturn: jest
      .fn()
      .mockResolvedValue(insertedStudentIds.map((studentId) => ({ studentId }))),
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
  };
  const prisma = { client: { groupMember } } as unknown as PrismaService;
  return { repository: new GroupMembersRepository(prisma), groupMember };
}

describe("GroupMembersRepository — ko'p qatorli insert tartibi (deadlock'siz)", () => {
  it("addActiveManyReportingConflicts: studentId bo'yicha tartiblab yozadi, to'qnashuvlar kirish tartibida", async () => {
    const { repository, groupMember } = setup([S_B]);
    const input = [S_C, S_A, S_B].map((studentId) => ({ groupId: G, studentId }));

    const conflicts = await repository.addActiveManyReportingConflicts(input);

    expect(groupMember.createManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [S_A, S_B, S_C].map((studentId) => ({ groupId: G, studentId })),
        skipDuplicates: true,
      }),
    );
    expect(conflicts).toEqual([S_C, S_A]);
    expect(input.map((membership) => membership.studentId)).toEqual([S_C, S_A, S_B]);
  });

  it("addActiveMany: studentId bo'yicha tartiblab yozadi; bo'sh ro'yxat — so'rov yo'q", async () => {
    const { repository, groupMember } = setup();

    await repository.addActiveMany([]);
    expect(groupMember.createMany).not.toHaveBeenCalled();

    await repository.addActiveMany([S_B, S_C, S_A].map((studentId) => ({ groupId: G, studentId })));
    expect(groupMember.createMany).toHaveBeenCalledWith({
      data: [S_A, S_B, S_C].map((studentId) => ({ groupId: G, studentId })),
    });
  });
});
