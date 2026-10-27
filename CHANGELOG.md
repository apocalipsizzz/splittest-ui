# @de-kit/st-ui

## 0.1.5

### Patch Changes

- В `@de-kit/st-ui/icons` добавлен `IconPause`: 20×20 и `currentColor`, как остальные `icon_*`. Размер перекрывается `width` и `height`.

## 0.1.4

### Patch Changes

- `Button` больше не вешает `button--default` и `button--md`: это базовые стили `.button`. Модификаторы остаются только у `outline`, `link`, `sm`, `lg`, `full-width` и `disabled`. Иконка передаётся в `children` с любой стороны и из любого набора. `fill` кнопок стал `currentColor`, иконка красится вместе с текстом. Класс `button__icon--spin` крутит спиннер внутри кнопки; при `prefers-reduced-motion` анимация выключена. Горизонтальный паддинг обычной кнопки — 20px.

## 0.1.3

### Patch Changes

- Иконки вынесены в `@de-kit/st-ui/icons`: импортируется только нужный компонент (`IconClose`, `ControlMarkCheckbox`, `LogoVisa`, `IllustrationTestBest`). `icon_*` и `control_*` — 20×20 и `currentColor`, стрелки галереи 20×40; размер перекрывается `width` и `height`. `icon_label-*` и `logo_*` оставляют заливку и размер из SVG. У `illustration_*` чёрный stroke заменён на `currentColor`. По умолчанию иконка `aria-hidden`, имя задаётся через `title` или `aria-label`.

## 0.1.2

### Patch Changes

- `Button`: пропы `variant` (`default` | `outline` | `link`, по умолчанию `default`) и `size` (`sm` | `md` | `lg`, по умолчанию `md`). Ширина 100% — отдельный `fullWidth`, его можно совмещать с любым размером. Булевы `outline`, `link` и `withIcon` убраны: иконка встаёт во flex с `gap`.
