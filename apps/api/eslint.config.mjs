import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { createBaseConfig } from '@lms/config/eslint';

export default defineConfig(
  // Prisma Client — `prisma generate` natijasi (git'da yo'q), lint qilinmaydi.
  { ignores: ['src/infra/prisma/generated/**'] },
  createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
);
