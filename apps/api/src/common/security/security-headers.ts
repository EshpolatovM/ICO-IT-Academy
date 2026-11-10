import helmet from 'helmet';

import type { RequestHandler } from 'express';

/** CSP qiymati: JSON API hech qanday resurs yuklamaydi va hech qayerga ramka ichida qo'yilmaydi. */
const NONE = "'none'";

/**
 * Xavfsizlik header'lari (docs/13 §8, helmet): `X-Content-Type-Options: nosniff`,
 * `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, CSP `default-src 'none'; frame-ancestors 'none'`.
 * HSTS — faqat production'da (dev http://localhost'da brauzer HTTPS'ga majburlanmasin), helmet
 * standart muddati bilan.
 */
export function securityHeaders(isProduction: boolean): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: { defaultSrc: [NONE], frameAncestors: [NONE] },
    },
    xFrameOptions: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
    xContentTypeOptions: true,
    strictTransportSecurity: isProduction,
  });
}
