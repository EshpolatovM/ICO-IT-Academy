import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

/**
 * Bazaviy ESLint flat config (barcha paketlar uchun).
 * Qat'iy qoidalar (max-lines, complexity va h.k.) 1.2-vazifada qo'shiladi.
 */
export const baseConfig = defineConfig(
  {
    ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/node_modules/**', '**/.turbo/**'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
);

export default baseConfig;
