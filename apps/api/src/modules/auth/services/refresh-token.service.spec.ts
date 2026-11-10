import { Logger } from '@nestjs/common';

import { ErrorCode, Role } from '@lms/shared';

import { hashRefreshToken, RefreshTokenService } from './refresh-token.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { RefreshTokensRepository } from '../repositories/refresh-tokens.repository.js';
import type { RefreshTokenRecord } from '../types/auth.types.js';

const STUDENT_TTL = 2_592_000;
const STAFF_TTL = 604_800;
const DAY_MS = 86_400_000;
const meta = { ip: '127.0.0.1', userAgent: 'jest' };

function record(overrides: Partial<RefreshTokenRecord> = {}): RefreshTokenRecord {
  return {
    id: 'rt-1',
    userId: 'u1',
    familyId: 'fam-1',
    userAgent: null,
    ip: null,
    expiresAt: new Date(Date.now() + DAY_MS),
    revokedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function createService(found: RefreshTokenRecord | null = record()) {
  const repo = {
    insert: jest.fn().mockResolvedValue(undefined),
    findByHash: jest.fn().mockResolvedValue(found),
    rotate: jest.fn().mockResolvedValue(true),
    revokeFamily: jest.fn().mockResolvedValue(2),
    findActiveByUser: jest.fn().mockResolvedValue([]),
  };
  const settings: Record<string, number> = {
    REFRESH_TTL_STUDENT_SECONDS: STUDENT_TTL,
    REFRESH_TTL_STAFF_SECONDS: STAFF_TTL,
  };
  const config = { get: (key: string) => settings[key] } as unknown as AppConfigService;
  const service = new RefreshTokenService(repo as unknown as RefreshTokensRepository, config);
  return { repo, service };
}

describe('RefreshTokenService', () => {
  const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

  afterAll(() => {
    loggerWarn.mockRestore();
  });

  it('issue: tasodifiy token, bazaga faqat SHA-256 hash, yangi oila; muddat rolga qarab', async () => {
    const { repo, service } = createService();

    const student = await service.issue({ userId: 'u1', role: Role.STUDENT }, meta);
    const staff = await service.issue({ userId: 'u2', role: Role.ADMIN }, meta);

    const [[studentData], [staffData]] = repo.insert.mock.calls as [
      [{ tokenHash: string; familyId: string }],
      [{ familyId: string }],
    ];
    expect(student.token).toMatch(/^[\w-]{43}$/);
    expect(studentData.tokenHash).toBe(hashRefreshToken(student.token));
    expect(studentData.tokenHash).toHaveLength(64);
    expect(studentData.familyId).not.toBe(staffData.familyId);
    const studentTtlMs = student.expiresAt.getTime() - Date.now();
    const staffTtlMs = staff.expiresAt.getTime() - Date.now();
    expect(Math.round(studentTtlMs / 1000)).toBe(STUDENT_TTL);
    expect(Math.round(staffTtlMs / 1000)).toBe(STAFF_TTL);
  });

  it('findActive: faol token qaytadi', async () => {
    const { repo, service } = createService();

    await expect(service.findActive('raw')).resolves.toMatchObject({ id: 'rt-1' });
    expect(repo.findByHash).toHaveBeenCalledWith(hashRefreshToken('raw'));
  });

  it("findActive: topilmasa yoki muddati o'tgan — 401, oila bekor qilinmaydi", async () => {
    const missing = createService(null);
    const expired = createService(record({ expiresAt: new Date(Date.now() - 1) }));

    await expect(missing.service.findActive('raw')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    await expect(expired.service.findActive('raw')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(expired.repo.revokeFamily).not.toHaveBeenCalled();
  });

  it('reuse detection: bekor qilingan token qayta kelsa — butun oila bekor va 401', async () => {
    const { repo, service } = createService(record({ revokedAt: new Date() }));

    await expect(service.findActive('raw')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    expect(repo.revokeFamily).toHaveBeenCalledWith('fam-1', expect.any(Date), undefined);
  });

  it('rotate: shu oilada yangi token, eskisi repository tranzaksiyasida bekor qilinadi', async () => {
    const { repo, service } = createService();

    const next = await service.rotate(record(), { userId: 'u1', role: Role.STUDENT }, meta);

    expect(repo.rotate).toHaveBeenCalledWith(
      'rt-1',
      expect.objectContaining({ familyId: 'fam-1', tokenHash: hashRefreshToken(next.token) }),
      expect.any(Date),
    );
  });

  it("rotate: parallel so'rovda yutqazsa (eski token allaqachon bekor) — oila bekor va 401", async () => {
    const { repo, service } = createService();
    repo.rotate.mockResolvedValue(false);

    await expect(
      service.rotate(record(), { userId: 'u1', role: Role.STUDENT }, meta),
    ).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
    expect(repo.revokeFamily).toHaveBeenCalledWith('fam-1', expect.any(Date), undefined);
  });

  it("findFamilyId: faqat token egasi uchun oila id'si", async () => {
    const { service } = createService();

    expect(await service.findFamilyId('raw', 'u1')).toBe('fam-1');
    expect(await service.findFamilyId('raw', 'boshqa')).toBeNull();
  });
});
