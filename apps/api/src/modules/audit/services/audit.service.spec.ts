import { AuditAction, AuditEntityType, Role } from '@lms/shared';

import { AuditService } from './audit.service.js';

import type { AuditLogsRepository } from '../repositories/audit-logs.repository.js';

function createService() {
  const logs = { insert: jest.fn().mockResolvedValue(undefined) };
  return { logs, service: new AuditService(logs as unknown as AuditLogsRepository) };
}

describe('AuditService', () => {
  it('actor, action, obyekt va IP ni yozadi', async () => {
    const { logs, service } = createService();

    await service.record({
      actor: { id: 'a1', role: Role.ADMIN },
      action: AuditAction.PARENT_TOKEN_CREATED,
      entityType: AuditEntityType.PARENT_ACCESS_TOKEN,
      entityId: 't1',
      after: { studentId: 's1', prefix: 'abcdef', label: 'Onasi' },
      ip: '10.0.0.1',
    });

    expect(logs.insert).toHaveBeenCalledWith({
      actorId: 'a1',
      actorRole: Role.ADMIN,
      action: AuditAction.PARENT_TOKEN_CREATED,
      entityType: AuditEntityType.PARENT_ACCESS_TOKEN,
      entityId: 't1',
      before: null,
      after: { studentId: 's1', prefix: 'abcdef', label: 'Onasi' },
      ip: '10.0.0.1',
    });
  });

  it('maxfiy maydonlar (parol, hash, token) hech qanday chuqurlikda yozilmaydi', async () => {
    const { logs, service } = createService();

    await service.record({
      actor: null,
      action: AuditAction.PASSWORD_RESET,
      entityType: AuditEntityType.USER,
      entityId: 'u1',
      before: {
        password_hash: 'h',
        password: 'p',
        tokenVersion: 1,
        nested: { temporaryPassword: 'x', ok: 1 },
      },
      after: {
        mustChangePassword: true,
        token: 'raw',
        tokenHash: 'hash',
        items: [{ refreshToken: 'r', id: 'i1' }],
        PARENT_TOKEN_PEPPER: 'p',
      },
      ip: null,
    });

    expect(logs.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: null,
        actorRole: null,
        before: { tokenVersion: 1, nested: { ok: 1 } },
        after: { mustChangePassword: true, items: [{ id: 'i1' }] },
      }),
    );
  });
});
