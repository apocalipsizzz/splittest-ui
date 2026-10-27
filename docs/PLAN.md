# @de-kit/st-ui

Библиотека для `splittest-frontend`. Не дизайн-система marketplace-ai и не Tailwind.

## Стек

- React 18/19, peer.
- Стили: CSS-переменные в `src/styles/vars.scss` (`--color-black`, `--font-sans`, `--radius-sm`). Имена как у Tailwind, значения splittest. Компоненты пишут `var(--color-*)` без `@use`. Токены один раз импортирует `src/index.ts`.
- Компонент = `tsx` + `*.scss` (side-effect импорт, без CSS-модулей). Класс снаружи через `className`, склейка в `src/lib/cn.ts`. Корень и модификаторы одинарные (`.button`, `.button--outline`), внутренние элементы — `checkbox__label`.
- Сборщик js — tsdown (`unbundle`, `neverBundle: /\.scss$/`, импорт `./button.scss` остаётся относительным). `scripts/copy-styles.mjs` кладёт scss в `dist` с той же структурой.
- Sass компилирует хост (CRA уже с `sass`). Готовый css библиотека не эмитит: в браузер уезжают custom properties.
- `global.scss` опционален. Это база из `src/app/styles/index.scss` без `@font-face`.

## Что уже есть

`Button`, `Input`, `TextArea`, `CheckboxInput`, `RadioInput`, `Spinner`.

Визуал снят с `src/shared/components/*`. Отличия от приложения:

- `Button` не зависит от `react-router`. Ссылка — проп `href` → `<a>`.
- Чекбокс и радио не красят все `input[type]` на странице: селекторы на `checkbox__input` / `radio__input`.
- `TextArea`: `hideCounter` вместо `noMaxMoty`.
- `Input` / `TextArea`: проп `recommended` красит фон в `color-mix` от `--color-yellow`. В модуле приложения класс вешался, правила не было.

## Дальше, когда понадобятся

Не тащить сюда виджеты с redux, роутером и API (`heatmap`, галереи, dropzone, navbar). Имеет смысл вынести самодостаточные: `Modal`, `Popup`, `Pagination`, `Select` — у модалки сейчас завязка на `react-transition-group`, `Portal` и хелперы `shared/helpers`.

Публичный API — только `src/index.ts`.
