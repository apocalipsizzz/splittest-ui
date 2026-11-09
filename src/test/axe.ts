import axe, { type AxeResults } from 'axe-core';

/**
 * Прогоняет axe по поддереву. Контраст в jsdom не считается (нет вёрстки и
 * вычисленных цветов), поэтому его отключаем и проверяем вручную в сторибуке.
 */
/**
 * Фокус-гварды FloatingFocusManager в браузере получают aria-hidden, а в jsdom
 * (нет поддержки inert) — нет. Исключаем их, иначе каждый лист падает на
 * aria-command-name у безымянных role="button".
 */
const FOCUS_GUARD = '[data-floating-ui-focus-guard]';

export const runAxe = async (element: Element): Promise<AxeResults> =>
  axe.run(
    { include: [element], exclude: [FOCUS_GUARD] },
    {
      rules: {
        'color-contrast': { enabled: false },
        // Landmark-структуру страницы задаёт приложение, не компонент.
        'region': { enabled: false },
      },
    },
  );

export const formatViolations = (results: AxeResults) =>
  results.violations.map(
    violation =>
      `${violation.id}: ${violation.help} (${violation.nodes
        .map(node => node.target.join(' '))
        .join(', ')})`,
  );
