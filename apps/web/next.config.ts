import type { NextConfig } from 'next';

/** API prefiksi (docs/12 §0). Brauzer faqat web origin'ga murojaat qiladi — Next uni API'ga uzatadi. */
const API_PREFIX = '/api/v1';

/**
 * Next server'dan API'ga ichki manzil (server env). Build vaqtida o'qiladi: `rewrites` routes manifest'ga
 * yoziladi, shuning uchun qiymat o'zgarsa qayta build kerak.
 */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/** Ota-ona tokeni URL'da bo'lishi mumkin — u Referer orqali tashqariga chiqmasin (docs/02 §5). */
const NO_REFERRER_HEADER = { key: 'Referrer-Policy', value: 'no-referrer' };

/** HSTS muddati: 1 yil (API'dagi helmet standarti bilan bir xil). */
const HSTS_MAX_AGE_SECONDS = 31_536_000;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Barcha sahifalar uchun xavfsizlik header'lari (docs/13 §8, review H5).
 * CSP ataylab faqat `frame-ancestors 'none'` (clickjacking'ga qarshi, `X-Frame-Options` ning zamonaviy
 * ekvivalenti): to'liq CSP (`script-src` va h.k.) Next.js'ning inline skriptlarini (hydration, RSC
 * payload) nonce/hash'siz bloklaydi — bu alohida (middleware + nonce) vazifa.
 * HSTS — faqat production'da: dev http://localhost'da brauzer HTTPS'ga majburlanmasin.
 */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ...(IS_PRODUCTION
    ? [
        {
          key: 'Strict-Transport-Security',
          value: `max-age=${String(HSTS_MAX_AGE_SECONDS)}; includeSubDomains`,
        },
      ]
    : []),
];

/**
 * Build papkasi. Standart `.next`; `NEXT_DIST_DIR` bilan boshqa papkaga build qilish mumkin —
 * ishlab turgan `next dev` (u ham `.next` dan foydalanadi) buzilmasligi uchun (masalan tekshiruv build'i).
 */
const DIST_DIR = process.env.NEXT_DIST_DIR ?? '.next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: DIST_DIR,
  rewrites() {
    return Promise.resolve([
      {
        source: `${API_PREFIX}/:path*`,
        destination: `${API_INTERNAL_URL}${API_PREFIX}/:path*`,
      },
    ]);
  },
  headers() {
    // Bir xil kalitli header'lardan oxirgisi g'olib — `/parent*` dagi `no-referrer` umumiysini bosadi.
    return Promise.resolve([
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/parent', headers: [NO_REFERRER_HEADER] },
      { source: '/parent/:path*', headers: [NO_REFERRER_HEADER] },
    ]);
  },
};

export default nextConfig;
