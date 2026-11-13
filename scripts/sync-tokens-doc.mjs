/**
 * Таблица токенов в README собирается из vars.scss. Руками она разъезжалась
 * трижды подряд: в README жили размеры, которых в коде уже не было.
 *
 * `node scripts/sync-tokens-doc.mjs` — переписать блок,
 * `--check` — только проверить (вызывается из `verify`).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const varsPath = join(root, 'src/styles/vars.scss');
const readmePath = join(root, 'README.md');

const START = '<!-- tokens:start -->';
const END = '<!-- tokens:end -->';

const GROUPS = [
  { title: 'Цвет', match: name => name.startsWith('--color-') },
  { title: 'Радиусы', match: name => name.startsWith('--radius-') },
  {
    title: 'Текст',
    match: name => name.startsWith('--text-') || name.startsWith('--font-'),
  },
  { title: 'Отступы', match: name => name.startsWith('--space-') },
  { title: 'Фокус и тень', match: name => /^--(focus|shadow)-/.test(name) },
  { title: 'Слои', match: name => name.startsWith('--z-') },
];

/**
 * Значение собирается до `;`: `color-mix()` длиннее 80 символов, и oxfmt
 * разносит его на пять строк. Пока склейки не было, такой токен молча
 * выпадал из таблицы — ровно то расхождение, от которого скрипт и написан.
 */
const readTokens = () => {
  const source = readFileSync(varsPath, 'utf8');
  const tokens = [];
  let name = null;
  let value = '';

  for (const raw of source.split('\n')) {
    // Хвостовой `// #ccc` — комментарий, а не часть значения.
    const line = raw.replace(/\/\/.*$/, '');

    if (name === null) {
      // Ровно два отступа: вложенные объявления (@each ниже) не токены.
      const start = /^\s{2}(--[\w-]+):\s*(.*)$/.exec(line);
      if (!start) continue;

      name = start[1];
      value = start[2];
    } else {
      value += ` ${line.trim()}`;
    }

    const end = value.indexOf(';');
    if (end < 0) continue;

    const text = value
      .slice(0, end)
      .replace(/\s+/g, ' ')
      .replace(/\(\s/g, '(')
      .replace(/\s\)/g, ')')
      .trim();
    if (text) tokens.push([name, text]);
    name = null;
    value = '';
  }

  return tokens;
};

const renderTable = tokens => {
  const lines = [];

  for (const group of GROUPS) {
    const rows = tokens.filter(([name]) => group.match(name));
    if (rows.length === 0) continue;

    lines.push(
      `**${group.title}**`,
      '',
      '| Токен | Значение |',
      '| --- | --- |',
    );
    for (const [name, value] of rows) {
      lines.push(`| \`${name}\` | \`${value}\` |`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
};

const block = [
  START,
  '',
  '<!-- Собрано scripts/sync-tokens-doc.mjs из src/styles/vars.scss. Руками не править. -->',
  '',
  renderTable(readTokens()),
  '',
  END,
].join('\n');

const readmeRaw = readFileSync(readmePath, 'utf8');
const eol = readmeRaw.includes('\r\n') ? '\r\n' : '\n';
const readme = readmeRaw.replace(/\r\n/g, '\n');
const from = readme.indexOf(START);
const to = readme.indexOf(END);

if (from < 0 || to < 0) {
  console.error(`README: нет маркеров ${START} … ${END}`);
  process.exit(1);
}

const next = readme.slice(0, from) + block + readme.slice(to + END.length);

if (next === readme) {
  console.log('tokens: README совпадает с vars.scss');
  process.exit(0);
}

if (process.argv.includes('--check')) {
  console.error(
    'tokens: README разошёлся с vars.scss. Запустите `pnpm run docs:tokens`.',
  );
  process.exit(1);
}

writeFileSync(readmePath, next.replace(/\n/g, eol));
console.log('tokens: README обновлён из vars.scss');
