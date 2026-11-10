import { Role } from '@lms/shared';

import { SessionIssuer } from './session-issuer.service.js';

import type { AccessTokenService } from './access-token.service.js';
import type { RefreshTokenService } from './refresh-token.service.js';

describe('SessionIssuer', () => {
  it('access token va yangi oiladagi refresh token birga qaytadi', async () => {
    const expiresAt = new Date('2026-12-01T00:00:00Z');
    const accessTokens = {
      sign: jest.fn().mockResolvedValue({ accessToken: 'jwt', expiresIn: 900 }),
    };
    const refreshTokens = {
      issue: jest.fn().mockResolvedValue({ token: 'raw-refresh', expiresAt }),
    };
    const issuer = new SessionIssuer(
      accessTokens as unknown as AccessTokenService,
      refreshTokens as unknown as RefreshTokenService,
    );
    const subject = { id: 'u1', role: Role.MENTOR, mustChangePassword: false, tokenVersion: 3 };
    const meta = { ip: '127.0.0.1', userAgent: 'jest' };

    const issued = await issuer.start(subject, meta);

    expect(issued).toEqual({
      accessToken: 'jwt',
      expiresIn: 900,
      refreshToken: { token: 'raw-refresh', expiresAt },
    });
    expect(accessTokens.sign).toHaveBeenCalledWith(subject);
    expect(refreshTokens.issue).toHaveBeenCalledWith({ userId: 'u1', role: Role.MENTOR }, meta);
  });
});
