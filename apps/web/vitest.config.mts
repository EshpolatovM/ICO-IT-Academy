import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const srcPath = (dir: string): string => fileURLToPath(new URL(`./src/${dir}`, import.meta.url));

/** apps/web unit testlari: Vitest + Testing Library (jsdom). Alias'lar tsconfig bilan bir xil. */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components': srcPath('components'),
      '@/features': srcPath('features'),
      '@/stores': srcPath('stores'),
      '@/lib': srcPath('lib'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
