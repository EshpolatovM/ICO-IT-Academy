import { JwtService } from '@nestjs/jwt';

import { ErrorCode, Role } from '@lms/shared';

import { ParentSessionTokenService } from './parent-session-token.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';

const TTL = 43_200;
const jwt = new JwtService({ secret: 's'.repeat(32), signOptions: { algorithm: 'HS256' } });
const config = { get: () => TTL } as unknown as AppConfigService;
const service = new ParentSessionTokenService(jwt, config);
const grants = [
  { tokenId: 't1', studentId: 's1' },
  { tokenId: 't2', studentId: 's2' },
];

describe('ParentSessionTokenService', () => {
  it('imzolaydi va tekshiradi: sub, role=PARENT, tokenIds/studentIds, 12 soat', async () => {
    const issued = await service.sign(grants);
    const payload = await service.verify(issued.token);

    expect(payload).toMatchObject({
      sub: 't1',
      role: Role.PARENT,
      tokenIds: ['t1', 't2'],
      studentIds: ['s1', 's2'],
    });
    expect(payload.exp - Math.floor(Date.now() / 1000)).toBeGreaterThan(TTL - 5);
    expect(service.shouldRenew(payload)).toBe(false);
    expect(service.shouldRenew({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 })).toBe(true);
  });

  it("access token (aud yo'q) yoki boshqa tarkib — 401", async () => {
    const access = await jwt.signAsync({ sub: 'u1', role: Role.ADMIN, mcp: false, ver: 0 });
    const wrongShape = await jwt.signAsync(
      { role: Role.PARENT, tokenIds: ['t1'], studentIds: [] },
      { subject: 't1', audience: 'parent-session' },
    );

    await expect(service.verify(access)).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
    await expect(service.verify(wrongShape)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    await expect(service.verify('buzilgan')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

  it("bo'sh grant ro'yxati bilan sessiya berilmaydi", async () => {
    await expect(service.sign([])).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
  });
});
