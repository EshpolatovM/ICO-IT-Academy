import { expect, test } from '@playwright/test';

/** H5: web sahifalarining xavfsizlik header'lari (`next.config.ts` → `headers()`). */
test("sahifalar xavfsizlik header'lari bilan qaytadi (/parent da no-referrer)", async ({
  page,
}) => {
  const login = await page.goto('/login');
  const headers = login?.headers() ?? {};
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['content-security-policy']).toBe("frame-ancestors 'none'");
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  // E2E — production build (`next build && next start`), shuning uchun HSTS ham bor.
  expect(headers['strict-transport-security']).toContain('max-age=');

  const parent = await page.goto('/parent');
  expect(parent?.headers()['referrer-policy']).toBe('no-referrer');
  expect(parent?.headers()['x-frame-options']).toBe('DENY');
});
