/**
 * tsdown собирает только js. scss копируем рядом с ним, чтобы
 * `import './button.scss'` в dist резолвился у консьюмера
 * (CRA + sass-loader / Vite), а `@use '../../styles/vars.scss'` внутри
 * подтягивал CSS-переменные.
 */
import { cpSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

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
