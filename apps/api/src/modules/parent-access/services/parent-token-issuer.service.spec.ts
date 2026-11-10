import { ParentTokenIssuer } from './parent-token-issuer.service.js';

import type { ParentTokenCrypto } from './parent-token-crypto.service.js';
import type { AppConfigService } from '../../../common/config/app-config.service.js';

const SETTINGS: Record<string, unknown> = {
  WEB_BASE_URL: 'https://app.example.uz',
  PARENT_MAX_ACTIVE_TOKENS: 3,
};
const config = { get: (key: string) => SETTINGS[key] } as unknown as AppConfigService;
const crypto = { generate: jest.fn() } as unknown as ParentTokenCrypto;
const issuer = new ParentTokenIssuer(crypto, config);

describe('ParentTokenIssuer', () => {
  it("javob: havola /parent?t=..., prefix, sana; limit config'dan", () => {
    const createdAt = new Date('2026-11-10T08:00:00Z');
    const token = 'k2Jd8x_-' + 'a'.repeat(35);

    expect(
      issuer.toCreatedResponse(
        {
          id: 't1',
          studentId: 's1',
          tokenPrefix: 'k2Jd8x',
          label: null,
          createdAt,
          lastUsedAt: null,
          useCount: 0,
          expiresAt: null,
        },
        token,
      ),
    ).toEqual({
      id: 't1',
      token,
      link: `https://app.example.uz/parent?t=${token}`,
      prefix: 'k2Jd8x',
      label: null,
      createdAt: '2026-11-10T08:00:00.000Z',
    });
    expect(issuer.maxActiveTokens).toBe(3);
  });
});
