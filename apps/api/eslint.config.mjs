import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { createBaseConfig } from '@lms/config/eslint';

export default defineConfig(createBaseConfig({ tsconfigRootDir: import.meta.dirname }), {
  languageOptions: {
    globals: { ...globals.node, ...globals.jest },
  },
});
