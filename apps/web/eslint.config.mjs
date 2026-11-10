import { baseConfig } from '@lms/config/eslint';
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  baseConfig,
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
);
