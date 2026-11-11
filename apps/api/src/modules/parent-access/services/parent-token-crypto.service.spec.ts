import { createHmac } from 'node:crypto';

import { ParentTokenCrypto } from './parent-token-crypto.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';

const PEPPER = 'p'.repeat(32);
const config = { get: () => PEPPER } as unknown as AppConfigService;
const crypto = new ParentTokenCrypto(config);

describe('ParentTokenCrypto', () => {
  it('token: 43 belgili base64url, prefix — 6 belgi, hash — HMAC-SHA256(pepper) hex', () => {
    const { token, tokenHash, tokenPrefix } = crypto.generate();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(tokenPrefix).toBe(token.slice(0, 6));
    expect(tokenHash).toBe(createHmac('sha256', PEPPER).update(token).digest('hex'));
    expect(tokenHash).toHaveLength(64);
  });

  it("har safar yangi token; hash deterministik, pepper bilan bog'liq", () => {
    expect(crypto.generate().token).not.toBe(crypto.generate().token);
    expect(crypto.hash('abc')).toBe(crypto.hash('abc'));
    const other = new ParentTokenCrypto({
      get: () => 'q'.repeat(32),
    } as unknown as AppConfigService);
    expect(other.hash('abc')).not.toBe(crypto.hash('abc'));
  });
});
