import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// Dedicated config for the heavy performance smoke test so it stays out of the
// default `npm run test` run but is runnable via `npm run test:perf`.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/performance/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
