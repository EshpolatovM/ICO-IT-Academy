import { describe, expect, it } from 'vitest';

import { readParentLinkToken } from './parent-link-token';

const TOKEN = 'k2Jd'.padEnd(43, 'x');
const OTHER_TOKEN = 'Zz9_'.padEnd(43, 'y');

function read(hash: string, query = '') {
  return readParentLinkToken({ hash, searchParams: new URLSearchParams(query) });
}

describe('readParentLinkToken', () => {
  it("`#t=` fragmentdan o'qiydi (S-70)", () => {
    expect(read(`#t=${TOKEN}`)).toEqual({ token: TOKEN, source: 'fragment' });
  });

  it("fragment bo'lmasa eski `?t=` query qabul qilinadi", () => {
    expect(read('', `t=${TOKEN}`)).toEqual({ token: TOKEN, source: 'query' });
  });

  it("ikkalasi ham bo'lsa fragment ustun", () => {
    expect(read(`#t=${TOKEN}`, `t=${OTHER_TOKEN}`)).toEqual({ token: TOKEN, source: 'fragment' });
  });

  it("bo'sh yoki boshqa fragment — query'ga qaytadi, u ham bo'lmasa null", () => {
    expect(read('#t=')).toBeNull();
    expect(read('#section', `t=${TOKEN}`)).toEqual({ token: TOKEN, source: 'query' });
    expect(read('')).toBeNull();
  });

  it('format tekshirmaydi — buzuq token ham qaytariladi (tekshiruv sessiya qatlamida)', () => {
    expect(read('#t=short')).toEqual({ token: 'short', source: 'fragment' });
  });
});
