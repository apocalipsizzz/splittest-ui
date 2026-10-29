# @de-kit/st-ui

## 0.1.8

### Patch Changes

- `Button` принимает `ref` в пропсах. Без `href` это `HTMLButtonElement`, с `href` — `HTMLAnchorElement`. Колбэк `(element: HTMLElement | null) => void` тоже подходит: так `ref` отдают dnd-kit и похожие библиотеки.

## 0.1.7

### Patch Changes

- Иконки в `@de-kit/st-ui/icons` переформатированы: JSX разбит по атрибутам. Пути, размеры, `currentColor` и пропы те же, картинка не меняется.

## 0.1.6

### Patch Changes

- `Field` оборачивает один контрол: лейбл, подсказка (`hint`, `hintPlacement`) и ошибка связаны через `aria-describedby` и `aria-errormessage`. `required` показывает «Поле «{label}» обязательно» (свой текст — `requiredMessage`), когда значение стёрли или браузер не пустил форму. У `CheckboxInput` и `RadioInput` проп `title` заменён на `label`. У чекбокса убраны `hide` и `withCursor`: клик по самому инпуту отключается через `clickable={false}`; добавлены `error` и `indeterminate`. `RadioGroup` задаёт общий `name`, рисует `fieldset` и держит `required` группы. У `Input` и `TextArea` размер `sm` | `md` | `lg`, как у кнопки; у `Input` этот проп занимает нативный `size`. `Input` получил `clearable`. У `TextArea` `hideCounter` заменён на `counter`: `counter={false}` прячет счётчик остатка при `maxLength`. `Button` получил `loading`: подпись остаётся в потоке, спиннер поверх, `aria-busy`, клик блокируется. `Spinner` принимает `size` и `label`, анимацию выключает `prefers-reduced-motion`. Пигменты `--color-black`, `--color-white`, `--color-blue`, `--color-red`, `--color-green`, `--color-yellow`, `--color-orange`, `--color-gray` и `--color-neutral-*` заменены ролями: `--color-foreground`, `--color-background`, `--color-primary`, `--color-accent`, `--color-destructive`, `--color-success`, `--color-warning`. `--breakpoint-sm` стал 480px, был 576. Из `mixins.scss` убраны `btn-min`, `input-min` и сбросы; остались `min-width` и `max-width` по `$breakpoints`.

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
