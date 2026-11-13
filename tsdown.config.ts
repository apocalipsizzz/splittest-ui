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
  // Карт не эмитим. С `unbundle` и target es2022 выхлоп — почти построчная
  // копия исходника: имена, комментарии и JSDoc на месте, меняются только JSX
  // (в вызовы `jsx`) и снятые типы, так что отлаживать можно прямо по dist.
  // А карты со `sourcesContent` занимали 785 КБ из 1477 КБ пакета — 53%, то
  // есть наши же исходники. Карты без `sourcesContent` тут не выход: `files`
  // не везёт `src`, и они ссылались бы в пустоту; нужны настоящие — публикуйте
  // вместе с `src`.
  sourcemap: false,
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
