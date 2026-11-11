import { existsSync } from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'prisma/config';

/**
 * Prisma CLI konfiguratsiyasi (Prisma 7: datasource URL va seed buyrug'i shu yerda).
 * Ildizdagi `.env` mavjud bo'lsa yuklanadi; muhitda allaqachon berilgan o'zgaruvchilar
 * (masalan `NODE_ENV=production`) ustidan yozilmaydi.
 */
const ROOT_ENV_FILE = path.resolve(__dirname, '..', '..', '.env');

if (existsSync(ROOT_ENV_FILE)) {
  process.loadEnvFile(ROOT_ENV_FILE);
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed/dev-seed.ts',
  },
  datasource: {
    // `prisma generate` URL'siz ham ishlaydi (CI); migrate/seed uchun DATABASE_URL shart.
    url: process.env.DATABASE_URL,
  },
});
