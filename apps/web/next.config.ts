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
    return Promise.resolve([
      { source: '/parent', headers: [NO_REFERRER_HEADER] },
      { source: '/parent/:path*', headers: [NO_REFERRER_HEADER] },
    ]);
  },
};

export default nextConfig;
