import { isIP } from 'node:net';

import { z } from 'zod';

/**
 * Express `trust proxy` (docs/13: reverse proxy ortida ishlash). Ishonchli proksi aniqlangandagina
 * `req.ip` `X-Forwarded-For` dan olinadi (rate limit, sessiya IP, audit, `parent_access_logs`).
 *
 * Qabul qilinadigan qiymatlar (Express/proxy-addr shakllaridan xavfsiz qismi):
 * - `false` — proksiga ishonilmaydi (Express standarti), `req.ip` = ulanish manzili;
 * - musbat butun son — ishonchli hop'lar soni (masalan `1`: bitta Nginx/LB);
 * - vergul bilan ajratilgan ro'yxat: `loopback` | `linklocal` | `uniquelocal` yoki IP / CIDR
 *   (masalan `loopback,10.0.0.0/8`).
 * `true` ataylab qabul qilinmaydi: u har qanday `X-Forwarded-For` ga ishonadi (IP soxtalashtirish).
 */
export type TrustProxySetting = false | number | string[];

const PROXY_PRESETS = new Set(['loopback', 'linklocal', 'uniquelocal']);
const IPV4_MAX_PREFIX = 32;
const IPV6_MAX_PREFIX = 128;
const IPV4_FAMILY = 4;
const HOP_COUNT = /^\d+$/;
const CIDR_PREFIX = /^\d{1,3}$/;
const LIST_SEPARATOR = ',';

function isValidCidr(value: string): boolean {
  const [address = '', prefix, ...rest] = value.split('/');
  const family = isIP(address);
  if (family === 0 || rest.length > 0) {
    return false;
  }
  if (prefix === undefined) {
    return true;
  }
  const maxPrefix = family === IPV4_FAMILY ? IPV4_MAX_PREFIX : IPV6_MAX_PREFIX;
  return CIDR_PREFIX.test(prefix) && Number(prefix) <= maxPrefix;
}

function isTrustedProxyEntry(entry: string): boolean {
  return PROXY_PRESETS.has(entry) || isValidCidr(entry);
}

function parseTrustProxy(raw: string, ctx: z.RefinementCtx): TrustProxySetting {
  const value = raw.trim();
  if (value === 'false') {
    return false;
  }
  if (HOP_COUNT.test(value) && Number(value) > 0) {
    return Number(value);
  }
  const entries = value.split(LIST_SEPARATOR).map((entry) => entry.trim());
  if (entries.length > 0 && entries.every(isTrustedProxyEntry)) {
    return entries;
  }
  ctx.addIssue({
    code: 'custom',
    message:
      "'false', musbat hop soni yoki loopback|linklocal|uniquelocal|IP|CIDR ro'yxati bo'lishi kerak",
  });
  return z.NEVER;
}

export const trustProxySchema = z.string().default('false').transform(parseTrustProxy);
