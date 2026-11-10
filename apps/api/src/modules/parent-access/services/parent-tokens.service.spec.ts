import { AuditAction, AuditEntityType, ErrorCode, Role } from '@lms/shared';

import { ParentTokenAuditor } from './parent-token-auditor.service.js';
import { ParentTokensService } from './parent-tokens.service.js';

import type { ParentTokenIssuer } from './parent-token-issuer.service.js';
import type { ParentTokenValidityCache } from './parent-token-validity.service.js';
import type { AuditService } from '../../audit/services/audit.service.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';
import type { ParentTokenRecord } from '../parent-access.types.js';
import type { ParentAccessTokensRepository } from '../repositories/parent-access-tokens.repository.js';

const CREATED_AT = new Date('2026-11-10T08:00:00Z');
const record = (id: string): ParentTokenRecord => ({
  id,
  studentId: 's1',
  tokenPrefix: 'k2Jd8x',
  label: 'Onasi',
  createdAt: CREATED_AT,
  lastUsedAt: null,
  useCount: 0,
  expiresAt: null,
});
const generated = { token: 'RAW', tokenHash: 'HASH', tokenPrefix: 'k2Jd8x' };
const actor = {
  user: { id: 'a1', role: Role.ADMIN, mustChangePassword: false },
  meta: { ip: '10.0.0.1', userAgent: 'jest' },
} as const;

function setup(overrides: Partial<Record<string, jest.Mock>> = {}) {
  const tokens = {
    listActive: jest.fn().mockResolvedValue([record('t1')]),
    createWithinLimit: jest.fn().mockResolvedValue(record('t1')),
    revoke: jest.fn().mockResolvedValue(record('t1')),
    regenerate: jest.fn().mockResolvedValue({ revoked: record('t1'), created: record('t2') }),
    ...overrides,
  };
  const users = { findStudent: jest.fn().mockResolvedValue({ id: 's1' }) };
  const issuer = {
    generate: jest.fn().mockReturnValue(generated),
    maxActiveTokens: 3,
    toCreatedResponse: jest.fn((r: ParentTokenRecord, token: string) => ({ id: r.id, token })),
  };
  const validity = { invalidate: jest.fn().mockResolvedValue(undefined) };
  const audit = { record: jest.fn().mockResolvedValue(undefined) };
  const service = new ParentTokensService(
    tokens as unknown as ParentAccessTokensRepository,
    users as unknown as UsersRepository,
    issuer as unknown as ParentTokenIssuer,
    validity as unknown as ParentTokenValidityCache,
    new ParentTokenAuditor(audit as unknown as AuditService),
  );
  return { service, tokens, users, validity, audit };
}

describe('ParentTokensService', () => {
  it("ro'yxat: faqat prefix va kuzatuv maydonlari (xom token/hash yo'q)", async () => {
    const { service } = setup();

    await expect(service.list('s1')).resolves.toEqual({
      items: [
        {
          id: 't1',
          prefix: 'k2Jd8x',
          label: 'Onasi',
          createdAt: CREATED_AT.toISOString(),
          lastUsedAt: null,
          useCount: 0,
          expiresAt: null,
        },
      ],
    });
  });

  it('student topilmasa — 404', async () => {
    const { service, users } = setup();
    users.findStudent.mockResolvedValue(null);

    await expect(service.list('s1')).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    await expect(service.create('s1', {}, actor)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it("yaratish: hash saqlanadi, limit config'dan, xom token javobda, audit (tokensiz)", async () => {
    const { service, tokens, audit } = setup();

    await expect(service.create('s1', { label: 'Onasi' }, actor)).resolves.toEqual({
      id: 't1',
      token: 'RAW',
    });
    expect(tokens.createWithinLimit).toHaveBeenCalledWith(
      {
        studentId: 's1',
        tokenHash: 'HASH',
        tokenPrefix: 'k2Jd8x',
        label: 'Onasi',
        createdById: 'a1',
      },
      3,
      expect.any(Date),
    );
    expect(audit.record).toHaveBeenCalledWith({
      actor: { id: 'a1', role: Role.ADMIN },
      action: AuditAction.PARENT_TOKEN_CREATED,
      entityType: AuditEntityType.PARENT_ACCESS_TOKEN,
      entityId: 't1',
      before: undefined,
      after: { studentId: 's1', prefix: 'k2Jd8x', label: 'Onasi' },
      ip: '10.0.0.1',
    });
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain('RAW');
  });

  it("limit to'lgan — 409 CONFLICT (details.limit), audit yozilmaydi", async () => {
    const { service, audit } = setup({ createWithinLimit: jest.fn().mockResolvedValue(null) });

    await expect(service.create('s1', {}, actor)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      status: 409,
      details: { limit: 3 },
    });
    expect(audit.record).not.toHaveBeenCalled();
  });

  it("bekor qilish: kesh o'chiriladi, audit; topilmasa — 404", async () => {
    const { service, tokens, validity, audit } = setup();

    await service.revoke('s1', 't1', actor);
    expect(tokens.revoke).toHaveBeenCalledWith(
      expect.objectContaining({ tokenId: 't1', studentId: 's1', revokedById: 'a1' }),
    );
    expect(validity.invalidate).toHaveBeenCalledWith('t1');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.PARENT_TOKEN_REVOKED, entityId: 't1' }),
    );

    tokens.revoke.mockResolvedValue(null);
    await expect(service.revoke('s1', 't1', actor)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it("qayta yaratish: revoke+create bitta chaqiruvda, eski kesh o'chiriladi, yangi xom token", async () => {
    const { service, tokens, validity, audit } = setup();

    await expect(service.regenerate('s1', 't1', actor)).resolves.toEqual({
      id: 't2',
      token: 'RAW',
    });
    expect(tokens.regenerate).toHaveBeenCalledWith(
      expect.objectContaining({ tokenId: 't1', studentId: 's1', revokedById: 'a1' }),
      { studentId: 's1', tokenHash: 'HASH', tokenPrefix: 'k2Jd8x', createdById: 'a1' },
    );
    expect(validity.invalidate).toHaveBeenCalledWith('t1');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.PARENT_TOKEN_REGENERATED,
        entityId: 't2',
        before: expect.objectContaining({ tokenId: 't1' }) as object,
      }),
    );
  });

  it('qayta yaratish: token faol emas yoki boshqa studentniki — 404', async () => {
    const { service, validity } = setup({ regenerate: jest.fn().mockResolvedValue(null) });

    await expect(service.regenerate('s1', 't1', actor)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    expect(validity.invalidate).not.toHaveBeenCalled();
  });
});
