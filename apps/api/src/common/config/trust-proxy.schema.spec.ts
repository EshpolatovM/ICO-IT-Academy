import { trustProxySchema } from './trust-proxy.schema.js';

describe('trustProxySchema (TRUST_PROXY)', () => {
  it('berilmasa — false (proksiga ishonilmaydi)', () => {
    expect(trustProxySchema.parse(undefined)).toBe(false);
  });

  it.each([
    ['false', false],
    ['1', 1],
    ['2', 2],
    ['loopback', ['loopback']],
    [' loopback , 10.0.0.0/8 ', ['loopback', '10.0.0.0/8']],
    ['linklocal,uniquelocal', ['linklocal', 'uniquelocal']],
    ['10.0.0.5', ['10.0.0.5']],
    ['fd00::/8,::1', ['fd00::/8', '::1']],
  ])('%s → Express qabul qiladigan qiymat', (raw, expected) => {
    expect(trustProxySchema.parse(raw)).toEqual(expected);
  });

  it.each([
    'true',
    '0',
    '-1',
    '',
    'localhost',
    'loopback,',
    '10.0.0.0/33',
    '10.0.0.0/8/1',
    '::1/129',
    '10.0.0.0/abc',
  ])("'%s' rad etiladi", (raw) => {
    expect(trustProxySchema.safeParse(raw).success).toBe(false);
  });
});
