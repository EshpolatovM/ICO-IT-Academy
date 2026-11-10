import {
  AuditAction,
  AuditEntityType,
  ErrorCode,
  passwordSchema,
  Role,
  UserStatus,
} from '@lms/shared';
import type { AccountRole } from '@lms/shared';

import { PasswordResetService } from './password-reset.service.js';

import type { PasswordHasher } from '../../../common/security/password-hasher.interface.js';
import type { AuditService } from '../../audit/services/audit.service.js';
import type { TokenVersionService } from '../../auth/services/token-version.service.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';

function userRecord(id: string, role: AccountRole) {
  return {
    id,
    role,
    phone: role === Role.STUDENT ? null : '+998900000001',
    studentCode: role === Role.STUDENT ? 'ST-10001' : null,
    passwordHash: 'old-hash',
    mustChangePassword: false,
    tokenVersion: 4,
    firstName: 'Ali',
    lastName: 'V',
    status: UserStatus.ACTIVE,
  };
}

function setup(target: ReturnType<typeof userRecord> | null) {
  const users = {
    findAuthById: jest.fn().mockResolvedValue(target),
    resetPassword: jest.fn().mockResolvedValue({ tokenVersion: 5 }),
  };
  const hasher = { hash: jest.fn((plain: string) => Promise.resolve(`hash(${plain})`)) };
  const tokenVersions = { remember: jest.fn().mockResolvedValue(undefined) };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  const service = new PasswordResetService(
    users as unknown as UsersRepository,
    hasher as unknown as PasswordHasher,
    tokenVersions as unknown as TokenVersionService,
    audit as unknown as AuditService,
  );
  return { service, users, tokenVersions, audit };
}

const actorOf = (role: AccountRole, id = 'actor') => ({
  user: { id, role, mustChangePassword: false },
  meta: { ip: '10.0.0.1', userAgent: 'jest' },
});

describe('PasswordResetService — student', () => {
  it('vaqtinchalik parol: 10 belgi, siyosatga mos; hash saqlanadi, ver keshi, audit (parolsiz)', async () => {
    const { service, users, tokenVersions, audit } = setup(userRecord('s1', Role.STUDENT));

    const { temporaryPassword } = await service.resetStudent('s1', actorOf(Role.ADMIN));

    expect(temporaryPassword).toHaveLength(10);
    expect(passwordSchema.safeParse(temporaryPassword).success).toBe(true);
    expect(users.resetPassword).toHaveBeenCalledWith('s1', {
      passwordHash: `hash(${temporaryPassword})`,
      revokedAt: expect.any(Date) as Date,
    });
    expect(tokenVersions.remember).toHaveBeenCalledWith('s1', 5);
    expect(audit.record).toHaveBeenCalledWith({
      actor: { id: 'actor', role: Role.ADMIN },
      action: AuditAction.PASSWORD_RESET,
      entityType: AuditEntityType.USER,
      entityId: 's1',
      before: { role: Role.STUDENT, mustChangePassword: false },
      after: { role: Role.STUDENT, mustChangePassword: true },
      ip: '10.0.0.1',
    });
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain(temporaryPassword);
  });

  it.each([null, userRecord('m1', Role.MENTOR)])(
    'student emas yoki topilmadi — 404',
    async (target) => {
      const { service, users } = setup(target);

      await expect(service.resetStudent('x', actorOf(Role.ADMIN))).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
      expect(users.resetPassword).not.toHaveBeenCalled();
    },
  );
});

describe('PasswordResetService — staff (ruxsat matritsasi)', () => {
  it.each([
    [Role.SUPER_ADMIN, Role.ADMIN],
    [Role.SUPER_ADMIN, Role.MENTOR],
    [Role.ADMIN, Role.MENTOR],
  ] as const)('%s → %s: ruxsat', async (actorRole, targetRole) => {
    const { service, users } = setup(userRecord('t1', targetRole));

    await expect(service.resetStaff('t1', actorOf(actorRole))).resolves.toEqual({
      temporaryPassword: expect.any(String) as string,
    });
    expect(users.resetPassword).toHaveBeenCalled();
  });

  it.each([
    [Role.ADMIN, Role.ADMIN],
    [Role.ADMIN, Role.SUPER_ADMIN],
    [Role.SUPER_ADMIN, Role.SUPER_ADMIN],
  ] as const)('%s → %s: 403', async (actorRole, targetRole) => {
    const { service, users } = setup(userRecord('t1', targetRole));

    await expect(service.resetStaff('t1', actorOf(actorRole))).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
    expect(users.resetPassword).not.toHaveBeenCalled();
  });

  it("o'zini tiklash — 403 (bazaga murojaat ham yo'q)", async () => {
    const { service, users } = setup(userRecord('me', Role.ADMIN));

    await expect(service.resetStaff('me', actorOf(Role.SUPER_ADMIN, 'me'))).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
    expect(users.findAuthById).not.toHaveBeenCalled();
  });

  it.each([null, userRecord('s1', Role.STUDENT)])(
    'xodim emas yoki topilmadi — 404',
    async (target) => {
      const { service } = setup(target);

      await expect(service.resetStaff('s1', actorOf(Role.SUPER_ADMIN))).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    },
  );
});
