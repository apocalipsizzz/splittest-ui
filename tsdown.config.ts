import { fileURLToPath } from 'node:url';

import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/icons/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  unbundle: true,
  alias: {
    '@/': fileURLToPath(new URL('./src/', import.meta.url)),
  },
  deps: {
    neverBundle: ['react', 'react-dom', 'react/jsx-runtime', /\.scss$/],
  },
  publint: false,
});
