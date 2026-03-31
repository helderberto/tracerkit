import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        bin: resolve(__dirname, 'src/bin.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^node:/],
      output: {
        banner: (chunk) => (chunk.name === 'bin' ? '#!/usr/bin/env node' : ''),
      },
    },
    target: 'node18',
    outDir: 'dist',
  },
});
