# @splittest/ui

Библиотека для `splittest-frontend`. Не дизайн-система marketplace-ai и не Tailwind.

## Стек

- React 18/19, peer.
- Стили: `src/styles/vars.scss` и `mixins.scss` — копия `splittest-frontend/src/app/styles`.
- Компонент = `tsx` + `*.module.scss`. Класс снаружи через `className`, склейка в `src/lib/cn.ts`.
- Сборщик js — tsdown (`unbundle`, чтобы импорт `./button.module.scss` остался относительным). `scripts/copy-styles.mjs` кладёт scss в `dist` с той же структурой.
- Sass компилирует хост (CRA уже с `sass`). Готовый css библиотека не эмитит: sass-переменные раскрываются у потребителя.
- `global.scss` опционален. Это база из `src/app/styles/index.scss` без `@font-face`.

## Что уже есть

`Button`, `Input`, `TextArea`, `CheckboxInput`, `RadioInput`, `Spinner`.

Визуал снят с `src/shared/components/*`. Отличия от приложения:

- `Button` не зависит от `react-router`. Ссылка — проп `href` → `<a>`.
- Чекбокс и радио не красят все `input[type]` на странице: селекторы заперты в модуле.
- `TextArea`: `hideCounter` вместо `noMaxMoty`.
- `Input` / `TextArea`: проп `recommended` красит фон в `$inputRecomendBg`. В модуле приложения класс вешался, правила не было.

## Дальше, когда понадобятся

Не тащить сюда виджеты с redux, роутером и API (`heatmap`, галереи, dropzone, navbar). Имеет смысл вынести самодостаточные: `Modal`, `Popup`, `Pagination`, `Select` — у модалки сейчас завязка на `react-transition-group`, `Portal` и хелперы `shared/helpers`.

Публичный API — только `src/index.ts`.
