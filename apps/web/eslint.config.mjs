import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';

import { createBaseConfig } from '@lms/config/eslint';

/*
 * Xom stil taqiqi (CLAUDE.md "Dizayn qoidasi"): rang/o'lcham/stil faqat design token'lar
 * (src/styles/tokens.css) va components/ui orqali.
 */

/** Tailwind standart palitra nomlari — ular tokens.css da o'chirilgan, semantik nomlar ishlatiladi. */
const TAILWIND_PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white';
const COLOR_UTILITIES =
  'bg|text|border|border-[xytrblse]|ring|ring-offset|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow|inset-shadow|drop-shadow|text-shadow';
const PALETTE_CLASS_RE = `/\\b(${COLOR_UTILITIES})-(${TAILWIND_PALETTE})(-\\d{2,3})?\\b/`;
const PALETTE_MESSAGE =
  'Tailwind standart rang klassi taqiqlangan — semantik token klassidan foydalaning (bg-primary, text-text-muted, border-border ...).';

/** Hex va CSS rang funksiyalari. */
const RAW_COLOR_RE =
  '/#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b|\\b(rgba?|hsla?|oklch|oklab|lab|lch|hwb)\\(/';
const RAW_COLOR_MESSAGE =
  "Xom rang (hex, rgb(), oklch() ...) taqiqlangan — design token'dan foydalaning.";

/** Arbitrary Tailwind qiymatlari: `w-[13px]`, `bg-[#fff]`, `[&>*]:...`, `bg-(--x)`. */
const ARBITRARY_CLASS_RE = '/\\[[^\\]]+\\]|-\\(--/';
const ARBITRARY_MESSAGE =
  "Arbitrary Tailwind qiymati taqiqlangan — token'lar shkalasidagi klass yoki components/ui dan foydalaning.";

const CLASS_CONTEXTS = ["JSXAttribute[name.name='className']", "CallExpression[callee.name='cn']"];

const paletteRestrictions = [
  { selector: `Literal[value=${PALETTE_CLASS_RE}]`, message: PALETTE_MESSAGE },
  { selector: `TemplateElement[value.raw=${PALETTE_CLASS_RE}]`, message: PALETTE_MESSAGE },
];

const rawStyleRestrictions = [
  ...paletteRestrictions,
  { selector: `Literal[value=${RAW_COLOR_RE}]`, message: RAW_COLOR_MESSAGE },
  { selector: `TemplateElement[value.raw=${RAW_COLOR_RE}]`, message: RAW_COLOR_MESSAGE },
  {
    selector: "JSXAttribute[name.name='style']",
    message: 'Inline `style` taqiqlangan — token klasslari yoki components/ui dan foydalaning.',
  },
  ...CLASS_CONTEXTS.flatMap((context) => [
    { selector: `${context} Literal[value=${ARBITRARY_CLASS_RE}]`, message: ARBITRARY_MESSAGE },
    {
      selector: `${context} TemplateElement[value.raw=${ARBITRARY_CLASS_RE}]`,
      message: ARBITRARY_MESSAGE,
    },
  ]),
];

export default defineConfig(
  createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    // Next.js tomonidan avtomatik yaratiladigan fayl; Playwright e2e build va natijalari.
    ignores: ['next-env.d.ts', '.next-e2e/**', 'playwright-report/**', 'test-results/**'],
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
  {
    // Butun src: Tailwind standart rang klasslari taqiqlangan (components/ui ham token'lardan foydalanadi).
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...paletteRestrictions] },
  },
  {
    // Sahifalar va feature'lar: qo'shimcha ravishda hex/rgb, inline style va arbitrary qiymatlar
    // taqiqlangan. components/ui va styles bundan mustasno.
    files: ['src/app/**/*.ts', 'src/app/**/*.tsx', 'src/features/**/*.ts', 'src/features/**/*.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...rawStyleRestrictions] },
  },
);
