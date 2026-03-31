import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(version),
  },
  test: {
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/test-setup.ts', 'src/**/*.test.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
