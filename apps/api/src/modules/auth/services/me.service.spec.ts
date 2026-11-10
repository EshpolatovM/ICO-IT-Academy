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

function createService(found: object | null) {
  const users = { findAuthById: jest.fn().mockResolvedValue(found) };
  return new MeService(users as unknown as UsersRepository);
}

describe('MeService', () => {
  it('AuthUser qaytaradi: hash va versiya chiqmaydi', async () => {
    await expect(createService(mentor).getMe('u1')).resolves.toEqual({
      id: 'u1',
      role: Role.MENTOR,
      firstName: 'Dev',
      lastName: 'Mentor',
      phone: '+998900000001',
      mustChangePassword: false,
    });
  });

  it("foydalanuvchi o'chirilgan — 401", async () => {
    await expect(createService(null).getMe('u1')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });
});
