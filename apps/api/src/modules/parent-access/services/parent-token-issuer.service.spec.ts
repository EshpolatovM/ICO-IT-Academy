import { parseParentLinkFragment } from '@lms/shared';

import { ParentTokenIssuer } from './parent-token-issuer.service.js';

import type { ParentTokenCrypto } from './parent-token-crypto.service.js';
import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { ParentTokenRecord } from '../parent-access.types.js';

const SETTINGS: Record<string, unknown> = {
  WEB_BASE_URL: 'https://app.example.uz',
  PARENT_MAX_ACTIVE_TOKENS: 3,
};
const config = { get: (key: string) => SETTINGS[key] } as unknown as AppConfigService;
const crypto = { generate: jest.fn() } as unknown as ParentTokenCrypto;
const issuer = new ParentTokenIssuer(crypto, config);
const TOKEN = 'k2Jd8x_-' + 'a'.repeat(35);
const CREATED_AT = new Date('2026-11-10T08:00:00Z');
const RECORD: ParentTokenRecord = {
  id: 't1',
  studentId: 's1',
  tokenPrefix: 'k2Jd8x',
  label: null,
  createdAt: CREATED_AT,
  lastUsedAt: null,
  useCount: 0,
  expiresAt: null,
};

describe('ParentTokenIssuer', () => {
  it("javob: havola /parent#t=..., prefix, sana; limit config'dan", () => {
    expect(issuer.toCreatedResponse(RECORD, TOKEN)).toEqual({
      id: 't1',
      token: TOKEN,
      link: `https://app.example.uz/parent#t=${TOKEN}`,
      prefix: 'k2Jd8x',
      label: null,
      createdAt: '2026-11-10T08:00:00.000Z',
    });
    expect(issuer.maxActiveTokens).toBe(3);
  });
});

/** API yasagan havola front tomonda o'sha shared helper bilan qaytib o'qilishi (S-70 kontrakti). */
describe('parseParentLinkFragment', () => {
  it('issuer havolasining fragmentidan tokenni qaytaradi', () => {
    const { link } = issuer.toCreatedResponse(RECORD, TOKEN);
    expect(parseParentLinkFragment(new URL(link).hash)).toBe(TOKEN);
  });

  it.each([['#x=1'], [''], ['#t='], ['#t=%E0%A4%A']])('%p uchun null', (hash) => {
    expect(parseParentLinkFragment(hash)).toBeNull();
  });

  it("'#' siz va boshqa parametrlar orasidan ham o'qiydi", () => {
    expect(parseParentLinkFragment(`x=1&t=${TOKEN}`)).toBe(TOKEN);
  });
});
