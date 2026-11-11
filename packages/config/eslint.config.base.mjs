import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

/**
 * Bazaviy ESLint flat config (barcha paketlar uchun). CLAUDE.md "Avtomatik sifat nazorati".
 *
 * Limitlar bir joyda nomlangan — qoidalar faqat shu yerda o'zgartiriladi.
 */
export const QUALITY_LIMITS = Object.freeze({
  maxLinesPerFile: 300,
  maxLinesPerFunction: 50,
  complexity: 10,
  maxDepth: 4,
  maxParams: 5,
  maxNestedCallbacks: 4,
});

/** Magic number hisoblanmaydigan qiymatlar. */
const ALLOWED_NUMBERS = [-1, 0, 1];

const TS_FILES = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const JS_FILES = ['**/*.js', '**/*.mjs', '**/*.cjs'];
const TEST_FILES = [
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.e2e-spec.ts',
  '**/*.test.ts',
  '**/*.test.tsx',
];

const sizeAndComplexityRules = {
  'max-lines': [
    'error',
    { max: QUALITY_LIMITS.maxLinesPerFile, skipBlankLines: true, skipComments: true },
  ],
  'max-lines-per-function': [
    'error',
    {
      max: QUALITY_LIMITS.maxLinesPerFunction,
      skipBlankLines: true,
      skipComments: true,
      IIFEs: true,
    },
  ],
  complexity: ['error', { max: QUALITY_LIMITS.complexity }],
  'max-depth': ['error', { max: QUALITY_LIMITS.maxDepth }],
  'max-nested-callbacks': ['error', { max: QUALITY_LIMITS.maxNestedCallbacks }],
};

const importRules = {
  'import-x/first': 'error',
  'import-x/newline-after-import': 'error',
  'import-x/no-duplicates': 'error',
  'import-x/no-self-import': 'error',
  'import-x/no-useless-path-segments': 'error',
  'import-x/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
      pathGroups: [
        { pattern: '@lms/**', group: 'internal', position: 'before' },
        { pattern: '@/**', group: 'internal' },
      ],
      pathGroupsExcludedImportTypes: ['builtin'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
};

const typeScriptRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'after-used',
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  '@typescript-eslint/max-params': ['error', { max: QUALITY_LIMITS.maxParams }],
  '@typescript-eslint/no-magic-numbers': [
    'error',
    {
      ignore: ALLOWED_NUMBERS,
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      ignoreEnums: true,
      ignoreNumericLiteralTypes: true,
      ignoreReadonlyClassProperties: true,
      ignoreTypeIndexes: true,
      enforceConst: true,
      detectObjects: false,
    },
  ],
  '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
  // NestJS modullari bo'sh, faqat dekoratorli class'lar (`@Module({}) class X {}`).
  '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
  '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
};

/**
 * Paket uchun to'liq ESLint config yaratadi.
 * @param {{ tsconfigRootDir: string }} options paketning ildizi (`import.meta.dirname`) — type-aware lint uchun.
 */
export function createBaseConfig({ tsconfigRootDir }) {
  return defineConfig(
    {
      ignores: [
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/node_modules/**',
        '**/.turbo/**',
      ],
    },
    {
      linterOptions: {
        // `eslint-disable` va boshqa inline konfiguratsiya taqiqlangan (CLAUDE.md).
        noInlineConfig: true,
        reportUnusedDisableDirectives: 'error',
        reportUnusedInlineConfigs: 'error',
      },
    },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
    },
    {
      plugins: { 'import-x': importX },
      rules: { ...sizeAndComplexityRules, ...importRules },
    },
    { files: TS_FILES, rules: typeScriptRules },
    {
      // JS konfiguratsiya fayllari tsconfig'ga kirmaydi — type-aware qoidalar o'chiriladi.
      files: JS_FILES,
      extends: [tseslint.configs.disableTypeChecked],
    },
    {
      // Testlarda `describe` bloki tabiiy ravishda uzun bo'ladi, kutilgan qiymatlar esa
      // aniq raqamlar bilan yoziladi — shu ikki qoida testlarda yumshatiladi.
      files: TEST_FILES,
      rules: {
        'max-lines-per-function': 'off',
        'max-nested-callbacks': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
      },
    },
    prettierConfig,
  );
}
