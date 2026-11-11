import { ErrorCode, Role, UserStatus } from '@lms/shared';

import { MeService } from './me.service.js';

import type { UsersRepository } from '../../users/repositories/users.repository.js';

const mentor = {
  id: 'u1',
  role: Role.MENTOR,
  phone: '+998900000001',
  studentCode: null,
  passwordHash: 'hash',
  mustChangePassword: false,
  tokenVersion: 4,
  firstName: 'Dev',
  lastName: 'Mentor',
  status: UserStatus.ACTIVE,
};

const account = { id: 'u1', role: Role.MENTOR, mustChangePassword: false } as const;

function createService(found: object | null, students: object[] = []) {
  const users = {
    findAuthById: jest.fn().mockResolvedValue(found),
    findChildrenByIds: jest.fn().mockResolvedValue(students),
  };
  return new MeService(users as unknown as UsersRepository);
}

describe('MeService', () => {
  it('AuthUser qaytaradi: hash va versiya chiqmaydi', async () => {
    await expect(createService(mentor).getMe(account)).resolves.toEqual({
      id: 'u1',
      role: Role.MENTOR,
      firstName: 'Dev',
      lastName: 'Mentor',
      phone: '+998900000001',
      mustChangePassword: false,
    });
  });

  it("foydalanuvchi o'chirilgan — 401", async () => {
    await expect(createService(null).getMe(account)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

  it('ota-ona — sessiyadagi farzandlar (sessiya tartibida, faol guruh nomi bilan)', async () => {
    const service = createService(null, [
      { id: 's2', firstName: 'Vali', lastName: 'B', groupName: 'FE-12' },
      { id: 's1', firstName: 'Ali', lastName: 'A', groupName: null },
    ]);
    const parent = {
      id: 't1',
      role: Role.PARENT,
      mustChangePassword: false,
      tokenIds: ['t1', 't2', 't3'],
      studentIds: ['s1', 's2', 'yoq'],
    } as const;

    await expect(service.getMe(parent)).resolves.toEqual({
      role: Role.PARENT,
      children: [
        { studentId: 's1', firstName: 'Ali', lastName: 'A', groupName: null },
        { studentId: 's2', firstName: 'Vali', lastName: 'B', groupName: 'FE-12' },
      ],
    });
  });
});
