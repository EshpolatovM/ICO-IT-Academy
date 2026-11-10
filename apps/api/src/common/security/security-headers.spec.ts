import { securityHeaders } from './security-headers.js';

import type { Request, Response } from 'express';

function headersOf(isProduction: boolean): Record<string, string> {
  const headers = new Map<string, string>();
  const response = {
    setHeader: (name: string, value: string) => headers.set(name.toLowerCase(), value),
    removeHeader: (name: string) => headers.delete(name.toLowerCase()),
  } as unknown as Response;
  const next = jest.fn();

  securityHeaders(isProduction)({} as Request, response, next);

  expect(next).toHaveBeenCalledWith();
  return Object.fromEntries(headers);
}

describe('securityHeaders (helmet)', () => {
  it('nosniff, X-Frame-Options DENY, no-referrer va JSON API uchun CSP', () => {
    const headers = headersOf(false);

    expect(headers).toMatchObject({
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'no-referrer',
      'content-security-policy': "default-src 'none';frame-ancestors 'none'",
    });
  });

  it("HSTS faqat production'da", () => {
    expect(headersOf(false)).not.toHaveProperty('strict-transport-security');
    expect(headersOf(true)['strict-transport-security']).toMatch(/^max-age=\d+/);
  });
});
