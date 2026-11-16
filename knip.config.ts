import type { KnipConfig } from 'knip';

// Sass-импорты knip не читает. `sass:*` — встроенные модули, не файлы.
const scss = (source: string) =>
  [...source.matchAll(/@(?:use|forward|import)\s+(['"])(?!sass:)([^'"]+)\1/g)]
    .flatMap(match => {
      const specifier = match[2];
      if (!specifier) return [];
      const file = specifier.endsWith('.scss')
        ? specifier
        : `${specifier}.scss`;
      return [`import '${file}';`];
    })
    .join('\n');

// Свой `entry` заменяет дефолт целиком, индексные шаблоны оставляем.
// Стили из `exports` — публичный API: в прод-графе их никто не импортирует,
// кроме тех, кого тянет `src/index.ts` или компонент.
const config: KnipConfig = {
  entry: [
    'src/{index,cli,main}.{js,mjs,cjs,jsx,ts,tsx,mts,cts}!',
    'src/styles/{global,reset,vars,mixins,typography}.scss!',
  ],
  // Хвост `!` — файл входит в `knip --production`. Без хвоста он есть только
  // в обычном прогоне. `!glob!` вычитается из прода и в обычном прогоне не участвует:
  // тесты, сторис и их хелперы — не мёртвый код библиотеки.
  project: [
    'src/**/*.{ts,tsx,scss,sass,mdx}!',
    '!src/**/*.{test,stories}.{ts,tsx}!',
    '!src/{stories,test}/**!',
    'scripts/**/*.mjs',
    '.storybook/**/*.{ts,tsx}',
    '*.{js,mjs,ts}',
  ],
  compilers: { scss },
  include: [
    'files',
    'dependencies',
    'devDependencies',
    'optionalPeerDependencies',
    'unlisted',
    'binaries',
    'unresolved',
    'exports',
    'types',
    'nsExports',
    'nsTypes',
    'duplicates',
    'enumMembers',
    'namespaceMembers',
    'cycles',
  ],
  rules: {
    cycles: 'error',
  },
  treatConfigHintsAsErrors: true,
};

export default config;
