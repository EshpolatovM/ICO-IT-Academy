import { RefreshCookieService } from './refresh-cookie.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { Response } from 'express';

function createService(secure: boolean) {
  const config = { get: () => secure } as unknown as AppConfigService;
  const response = { cookie: jest.fn(), clearCookie: jest.fn() };
  return { response, service: new RefreshCookieService(config) };
}

describe('RefreshCookieService', () => {
  it("rt: HttpOnly, SameSite=Strict, Path=/api/v1/auth, Secure env'dan, muddat tokenniki", () => {
    const { response, service } = createService(true);
    const expiresAt = new Date('2026-12-10T08:00:00Z');

    service.set(response as unknown as Response, { token: 'raw', expiresAt });

    expect(response.cookie).toHaveBeenCalledWith('rt', 'raw', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/auth',
      expires: expiresAt,
    });
  });

  it("clear: xuddi shu atributlar bilan o'chiradi", () => {
    const { response, service } = createService(false);

    service.clear(response as unknown as Response);

    expect(response.clearCookie).toHaveBeenCalledWith('rt', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  });
});
