import { fileURLToPath } from 'node:url';

import { defineConfig } from 'tsdown';

export default defineConfig({
  // Каждый компонент — своя точка входа: без этого `@de-kit/st-ui/components/button`
  // не во что резолвить, а в Jest и RSC корневой баррель тянет весь пакет.
  entry: ['src/index.ts', 'src/icons/index.ts', 'src/components/*/index.ts'],
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
    neverBundle: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-imask',
      '@floating-ui/react',
      '@floating-ui/dom',
      /\.scss$/,
    ],
  },
  publint: false,
});
