import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/lib/**/*.ts'],
      exclude: [
        'src/lib/**/index.ts',
        'src/lib/insights/types.ts',
        // Export modules are browser/DOM-bound (download, canvas, jsPDF) and are
        // exercised by the Playwright e2e suite rather than jsdom unit tests.
        'src/lib/export/csv.ts',
        'src/lib/export/pdf.ts',
      ],
      thresholds: {
        'src/lib/analysis/**': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90,
        },
        'src/lib/insights/**': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90,
        },
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
