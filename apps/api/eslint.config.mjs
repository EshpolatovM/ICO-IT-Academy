import { baseConfig } from '@lms/config/eslint';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig(baseConfig, {
  languageOptions: {
    globals: { ...globals.node, ...globals.jest },
  },
});
