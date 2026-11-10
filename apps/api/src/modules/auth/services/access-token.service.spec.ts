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
      { expiresIn: -1 },
    );

    await expect(service.verify(expired)).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
  });

  it("tarkibi noto'g'ri (masalan PARENT roli yoki ver yo'q) — 401", async () => {
    const { jwt, service } = createService();
    const parent = await jwt.signAsync({ sub: 'x', role: Role.PARENT, mcp: false, ver: 0 });
    const noVersion = await jwt.signAsync({ sub: 'x', role: Role.ADMIN, mcp: false });

    await expect(service.verify(parent)).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
    await expect(service.verify(noVersion)).rejects.toMatchObject({
      code: ErrorCode.UNAUTHORIZED,
    });
  });
});
