import { JwtService } from '@nestjs/jwt';

import { ErrorCode, Role } from '@lms/shared';

import { AccessTokenService } from './access-token.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';

const SECRET = 'unit-test-secret-'.padEnd(32, 'x');
const TTL_SECONDS = 900;

function createService(
  jwt = new JwtService({ secret: SECRET, signOptions: { expiresIn: TTL_SECONDS } }),
) {
  const config = { get: () => TTL_SECONDS } as unknown as AppConfigService;
  return { jwt, service: new AccessTokenService(jwt, config) };
}

const ACCESS = { audience: 'access' } as const;

const subject = { id: 'user-1', role: Role.MENTOR, mustChangePassword: true, tokenVersion: 3 };

describe('AccessTokenService', () => {
  it('imzolaydi: sub/role/mcp/ver va expiresIn (env)', async () => {
    const { service } = createService();

    const { accessToken, expiresIn } = await service.sign(subject);

    expect(expiresIn).toBe(TTL_SECONDS);
    await expect(service.verify(accessToken)).resolves.toEqual({
      sub: 'user-1',
      role: Role.MENTOR,
      mcp: true,
      ver: 3,
    });
  });

  it('boshqa kalit bilan imzolangan yoki buzilgan token — 401', async () => {
    const { service } = createService();
    const foreign = await new JwtService({ secret: 'boshqa-'.padEnd(32, 'y') }).signAsync({
      sub: 'x',
      role: Role.ADMIN,
      mcp: false,
      ver: 0,
    });

    await expect(service.verify(foreign)).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
    await expect(service.verify('buzilgan.token')).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

  it("muddati o'tgan token — 401", async () => {
    const { jwt, service } = createService();
    const expired = await jwt.signAsync(
      { sub: 'x', role: Role.ADMIN, mcp: false, ver: 0 },
      { ...ACCESS, expiresIn: -1 },
    );

    await expect(service.verify(expired)).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
  });

  it("tarkibi noto'g'ri (masalan PARENT roli yoki ver yo'q) — 401", async () => {
    const { jwt, service } = createService();
    const parent = await jwt.signAsync({ sub: 'x', role: Role.PARENT, mcp: false, ver: 0 }, ACCESS);
    const noVersion = await jwt.signAsync({ sub: 'x', role: Role.ADMIN, mcp: false }, ACCESS);

    await expect(service.verify(parent)).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
    await expect(service.verify(noVersion)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });

  it("aud yo'q yoki boshqa (masalan parent-session) — 401; imzolangan token aud=access", async () => {
    const { jwt, service } = createService();
    const payload = { sub: 'x', role: Role.ADMIN, mcp: false, ver: 0 };
    const withoutAudience = await jwt.signAsync(payload);
    const parentAudience = await jwt.signAsync(payload, { audience: 'parent-session' });

    await expect(service.verify(withoutAudience)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    await expect(service.verify(parentAudience)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
    const { accessToken } = await service.sign(subject);
    expect(jwt.decode<{ aud: string }>(accessToken).aud).toBe('access');
  });
});
