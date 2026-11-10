import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';

import { createBaseConfig } from '@lms/config/eslint';

export default defineConfig(
  createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    // Next.js tomonidan avtomatik yaratiladigan fayl.
    ignores: ['next-env.d.ts'],
  },
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    // Uzun nisbiy importlar taqiqlanadi — `@/components`, `@/features`, `@/stores`, `@/lib`
    // alias'lari ishlatiladi (CLAUDE.md "Frontend state va tuzilma").
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message:
                "Uzun nisbiy import taqiqlangan: '@/components', '@/features', '@/stores', '@/lib' alias'laridan foydalaning.",
            },
          ],
        },
      ],
    },
  },
);
