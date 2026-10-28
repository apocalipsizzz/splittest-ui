# @de-kit/st-ui

Библиотека для `splittest-frontend`. Не дизайн-система marketplace-ai и не Tailwind.

## Стек

- React 18/19, peer.
- Стили: CSS-переменные в `src/styles/vars.scss` (`--color-foreground`, `--color-primary`, `--font-sans`, `--radius-sm`). Роли как у Tailwind v4, значения splittest. Компоненты пишут `var(--color-*)` без `@use`. Токены один раз импортирует `src/index.ts`.
- Компонент = `tsx` + `*.scss` (side-effect импорт, без CSS-модулей). Класс снаружи через `className`, склейка в `src/lib/cn.ts`. Корень и модификаторы одинарные (`.button`, `.button--outline`), внутренние элементы — `checkbox__label`.
- Сборщик js — tsdown (`unbundle`, `neverBundle: /\.scss$/`, импорт `./button.scss` остаётся относительным). `scripts/copy-styles.mjs` кладёт scss в `dist` с той же структурой.
- Sass компилирует хост (CRA уже с `sass`). Готовый css библиотека не эмитит: в браузер уезжают custom properties.
- `global.scss` опционален. Это база из `src/app/styles/index.scss` без `@font-face`.

## Что уже есть

`Button`, `Input`, `TextArea`, `CheckboxInput`, `RadioInput`, `Spinner`, иконки (`@de-kit/st-ui/icons`).

Визуал снят с `src/shared/components/*`. Отличия от приложения:

- `Button` не зависит от `react-router`. Ссылка — проп `href` → `<a>`.
- Чекбокс и радио не красят все `input[type]` на странице: селекторы на `checkbox__input` / `radio__input`.
- `TextArea`: `counter={false}` вместо `noMaxMoty`.
- `Input` / `TextArea`: проп `recommended` красит фон в `--color-recommended`. В модуле приложения класс вешался, правила не было.

## Дальше, когда понадобятся

Не тащить сюда виджеты с redux, роутером и API (`heatmap`, галереи, dropzone, navbar). Имеет смысл вынести самодостаточные: `Modal`, `Popup`, `Pagination`, `Select` — у модалки сейчас завязка на `react-transition-group`, `Portal` и хелперы `shared/helpers`.

Публичный API — `src/index.ts` и `src/icons/index.ts`.
