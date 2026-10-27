# @de-kit/st-ui

## 0.1.3

### Patch Changes

- Иконки вынесены в `@de-kit/st-ui/icons`: импортируется только нужный компонент (`IconClose`, `ControlMarkCheckbox`, `LogoVisa`, `IllustrationTestBest`). `icon_*` и `control_*` — 20×20 и `currentColor`, стрелки галереи 20×40; размер перекрывается `width` и `height`. `icon_label-*` и `logo_*` оставляют заливку и размер из SVG. У `illustration_*` чёрный stroke заменён на `currentColor`. По умолчанию иконка `aria-hidden`, имя задаётся через `title` или `aria-label`.

## 0.1.2

### Patch Changes

- `Button`: пропы `variant` (`default` | `outline` | `link`, по умолчанию `default`) и `size` (`sm` | `md` | `lg`, по умолчанию `md`). Ширина 100% — отдельный `fullWidth`, его можно совмещать с любым размером. Булевы `outline`, `link` и `withIcon` убраны: иконка встаёт во flex с `gap`.
