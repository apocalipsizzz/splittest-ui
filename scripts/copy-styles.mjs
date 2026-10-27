/**
 * tsdown собирает только js. scss копируем рядом с ним, чтобы
 * `import './button.scss'` и `import './styles/vars.scss'` в dist
 * резолвились у консьюмера (CRA + sass-loader / Vite).
 */
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

const scssImport = /^import ['"]\.\/[^'"]+\.scss['"];\r?\n/gm;

const walk = dir => {
  for (const entry of readdirSync(dir)) {
    const from = join(dir, entry);
    if (statSync(from).isDirectory()) {
      walk(from);
      continue;
    }
    if (!entry.endsWith('.scss')) continue;

    const to = join(dist, relative(src, from));
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
    console.log(`scss: ${relative(root, from)} -> ${relative(root, to)}`);
  }
};

walk(src);

// attw резолвит import "./button.scss" в .d.ts как TS-модуль и не находит его.
// В js импорт остаётся: стили по-прежнему подхватывает бандлер хоста.
const stripScssImports = dir => {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    if (statSync(file).isDirectory()) {
      stripScssImports(file);
      continue;
    }
    if (!entry.endsWith('.d.ts') && !entry.endsWith('.d.cts')) continue;

    const source = readFileSync(file, 'utf8');
    const next = source.replace(scssImport, '');
    if (next === source) continue;

    writeFileSync(file, next);
    console.log(`dts: dropped scss import in ${relative(root, file)}`);
  }
};

stripScssImports(dist);
