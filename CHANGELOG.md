# @de-kit/st-ui

## 0.3.0

### Minor Changes

- Слои, доступность и публичный контракт.

  **Ломающее**

  - `PopupSheet`, `Popover` и лист `DatePicker` рендерятся в портале у `body`, а не на месте вызова: правила, опиравшиеся на прежнего родителя, нужно проверить.
  - У `PopupSheet` больше нет пропа `positionVertical` — он ничего не делал.
  - У `DatePicker` больше нет пропа `closeLabel`: вуаль перестала быть кнопкой и скрыта от скринридера.
  - Неуправляемый `Popover` (без пропа `open`) переключается кликом по якорю. У управляемого поведение прежнее.

  **Слои**

  - `PopupSheet` и лист `DatePicker` стали модальными: ловушка фокуса, `role="dialog"` с `aria-modal`, `aria-hidden` на остальной странице, возврат фокуса на триггер. Закрытый лист в DOM не остаётся.
  - Общий `FloatingTree`: Escape закрывает верхний слой, а не все сразу.
  - Один `useScrollLock` со счётчиком ссылок вместо двух несовместимых блокировок; `.body--close` убран.
  - ARIA `Popover` уезжает на сам триггер, а не на обёртку-`span`.
  - Один селектор порталов на библиотеку: клик по дропдауну внутри листа больше не закрывает лист.

  **Контракт**

  - Единая триада `value` / `defaultValue` / `onChange` и `open` / `defaultOpen` / `onOpenChange`: `PopupSheet`, `Popover`, `DatePicker`, селекты. `onClose` остаётся короткой формой.
  - `forwardRef` и rest-пропсы у всех составных компонентов.
  - Из корня экспортируются `cn`, `Slot`, `useFieldControl` и `filterSelectOptions`.
  - Подпути `@de-kit/st-ui/components/*` и `@de-kit/st-ui/reset.scss`.
  - `sass` заявлен необязательной peer-зависимостью, требования к сборке описаны в README.
  - Состояния пишутся в `data-state`, `data-invalid`, `data-disabled`, `data-highlighted`, `data-selected`.
  - `Field` принимает управляемый `invalid`, `Form` — `errorFallback`, `Select` и `SelectSearch` — `renderOption` и `onOpenChange`.

  **Исправления**

  - `required` из `Field` в `SelectSearch` проверяет выбор, а не набранный запрос: `requestSubmit` при открытом списке больше не отправляет пустое значение.
  - Typeahead в селектах собирает строку с паузой 500 мс, добавлены PageUp/PageDown. Пункт выбирается на `mousedown`, до blur поля, поэтому клик по нему не закрывает родительский лист. Синтетический `click` (`element.click()`, активация в мобильных скринридерах) тоже выбирает: у него `detail === 0`, и выбор после настоящего указателя не повторяется.
  - `CheckboxInput` не переписывает содержимое лейбла: ссылка внутри сохраняет свои `target`/`rel`, Ctrl/⌘-клик работает.
  - `useMediaQuery` на `useSyncExternalStore` — без рассинхрона гидрации.
  - `Spinner` анимируется CSS, а не SMIL: `prefers-reduced-motion` учитывается до первой отрисовки.
  - `FormProps.onSubmit` типизирован `FormEvent`, а не `SubmitEvent`: сборка на `@types/react@18` больше не падает.
  - Подписи вынесены в пропсы, месяцы `DatePicker` — из `Intl.DateTimeFormat` по `locale`.
  - `reset.scss` отделён от каркаса приложения в `global.scss`.

## 0.2.0

### Minor Changes

- Добавлен `Select`: кнопка открывает список в портале на ширину поля, у выбранного пункта галочка. В форму и `Field` уходит значение пункта, не подпись.

  Добавлен `SelectSearch`: тот же список, в открытом поле можно искать. Поиск без регистра, «ё» считается как «е», чужая раскладка тоже находится. Дополнительные слова задаются через `keywords`.

## 0.1.29

### Patch Changes

- `CheckboxInput` со своим `id` больше не берёт id у `Field`. Несколько чекбоксов в одном поле сохраняют разные id, и клик по лейблу переключает свой чекбокс, а не первый. Без своего `id` чекбокс по-прежнему связан с лейблом поля.

  Подчёркивание ссылки в лейбле задаётся для любого `a` внутри `.checkbox__label`.

## 0.1.28

### Patch Changes

- `CheckboxInput`: ссылка в лейбле — обычный `<a>` внутри `label`. Компонент ставит `checkbox__link`, открывает адрес в новой вкладке и не даёт этому клику переключить чекбокс. Пропы `url` и `urlLabel` убраны.

## 0.1.27

### Patch Changes

- - `CheckboxInput` принимает `url` и `urlLabel`: ссылка рисуется в конце лейбла, подчёркнута, открывается в новой вкладке. Клик по ней не переключает чекбокс. Без одного из пропов ссылка не рисуется.
  - `Form` без своего `onSubmit` больше не уходит в нативный GET на текущий адрес: поля не попадают в query, историю и Referer. Нативный сабмит остаётся только с явным `action` и без обработчика.
  - У `Button` вариантов `link` и `destructive` в disabled сохранён свой цвет текста.
  - `Popover`: фон, отступы и ограничение ширины переведены на токены (`--color-background`, `--space-*`).

## 0.1.26

### Patch Changes

- `Input` принимает `noWrap`: `div.input__wrap` не рисуется. С `noWrap` крестик `clearable` тоже не рисуется — он позиционируется от этой обёртки.

## 0.1.25

### Patch Changes

- Добавлен **`PopupSheet`** — нижний sheet с заголовком, закрытием, блокировкой скролла и `POPUP_SHEET_PORTAL_SELECTOR`.

  Добавлен **`Popover`** на `@floating-ui/react`: якорь через `trigger`, позиция по умолчанию над кнопкой (`top-start`) с `flip`/`shift`, portal, закрытие снаружи/Escape. Ширина панели **не** привязана к якорю: `minWidth` 280px, `maxWidth` 360px (`POPOVER_MIN_WIDTH`, `POPOVER_MAX_WIDTH`). Экспорт `POPOVER_PORTAL_SELECTOR`.

## 0.1.23

### Patch Changes

- Добавлен компонент `PopupSheet` — нижний sheet (slide-up) с заголовком, кнопкой закрытия, блокировкой скролла `body`, закрытием по клику вне области, Escape и `onClose`. Для выпадающих порталов внутри sheet экспортирован селектор `POPUP_SHEET_PORTAL_SELECTOR` (`data-popup-sheet-portal`).

## 0.1.22

### Patch Changes

- - Добавлен вариант `Button` `destructive` в стиле красной ссылочной кнопки.
  - В `vars.scss` добавлены токены `--radius-md` и `--radius-rounded`, а `--radius-lg` приведён к значению `30px`.
  - В `DatePicker` радиус верхних углов листа переведён на `--radius-md`.
  - В примеры кода `RadioGroup` добавлен `FieldList` для групп из нескольких радио-кнопок.

## 0.1.21

### Patch Changes

- - Добавлен и экспортирован `FieldList` для вертикального списка полей с единым отступом.
  - `RadioGroup` теперь поддерживает собственные `label`, `hint` и `error` с корректными ARIA-связями.
  - Состояние ошибки `RadioGroup` передаётся дочерним `RadioInput`, а выбранное значение корректно сбрасывает ошибку поля.
  - Расширены тесты и Storybook-примеры для `Field`, `RadioGroup` и остальных компонентов.
  - Добавлен переиспользуемый `CodeBlock` с подсветкой TSX для примеров в Storybook.
  - Добавлены зависимости `react-syntax-highlighter` и `@types/react-syntax-highlighter`.

## 0.1.20

### Patch Changes

- Хук `useMediaQuery(query)` для адаптивного поведения в JS (например, число строк у TextArea): подписан на matchMedia, первое значение доступно сразу.

## 0.1.19

### Patch Changes

- Экспорт `@de-kit/st-ui/typography.scss`: шкала текста и заголовков (классы `.text-*`, `.heading-*` и стили h1–h4) для приложений, которые не подключают `global.scss`.

## 0.1.18

### Patch Changes

- - Добавлена Storybook-документация типографики: шкала размеров, теги заголовков, классы `.heading-*` и `.text-*`, а также варианты веса шрифта.
  - В `vars.scss` добавлены токены веса шрифта: `black`, `bold`, `semibold`, `medium` и `normal`.
  - Улучшен `Input`: увеличена область кнопки очистки и добавлен курсор указателя.

## 0.1.17

### Patch Changes

- - Добавлена типографическая система: классы `.text-*`, `.heading-*` и стили заголовков `h1`–`h4`.
  - В `mixins.scss` добавлены миксины для текстовых ролей и заголовков.
  - В `vars.scss` добавлены токен веса шрифта и обновлена шкала размеров текста с line-height.
  - Стили метки `Field` переведены на новые типографические токены.

## 0.1.16

### Patch Changes

- - Добавлен компонент `HR` для горизонтального разделителя и экспортирован из публичного API.
  - Расширена шкала CSS-токенов отступов `--space-5` до `--space-16`.
  - Обновлены отступы в `Button`, `BirthdayPicker` и глобальных стилях: вместо числовых значений используются токены.

## 0.1.15

### Patch Changes

- - Исправлены импорты SCSS в `BirthdayPicker` и `PhoneInput`: `@/components/input/input.scss` заменён на относительный путь, чтобы консьюмеры без алиаса `@/` могли собирать пакет.
  - В `scripts/copy-styles.mjs` добавлена проверка `assertNoAliasImports`, которая ломает сборку, если в `dist` остались импорты с алиасом `@/`.

## 0.1.14

### Patch Changes

- - Добавлен компонент `Form` с поддержкой асинхронного сабмита, состояния ожидания и вывода ошибок.
  - Добавлен компонент `BirthdayPicker` — выбор даты рождения через нижний лист с барабанами дня, месяца и года.
  - Добавлен компонент `PhoneInput` — телефонное поле с маской на базе `react-imask`.
  - Новые компоненты и `PHONE_MASK` экспортированы из `src/index.ts`.
  - Добавлена зависимость `react-imask` и вынесена из бандла в `tsdown.config.ts`.
  - Обновлены Storybook-зависимости до `10.6.5`.
  - Исправлены переносы строк в SVG-путях иконок Ozon и Yandex (`\r\n` → `\n`).
  - В `pnpm-workspace.yaml` запрещена сборка `core-js-pure`.

## 0.1.13

### Patch Changes

- 10cce6b: `IconGalleryNext` и `IconGalleryPrev` рисуются 20×20. `viewBox` остаётся `0 0 20 40`.

## 0.1.12

### Patch Changes

- `Field`: проп `label` необязателен. Без него `<label>` не рисуется, `aria-labelledby` на контрол не вешается. Текст `required` без строкового лейбла — «Обязательное поле».

## 0.1.11

### Patch Changes

- `Button`: `:active` красится в `--color-primary`, раньше был `--color-muted`. Те же состояния можно включить атрибутами `data-active`, `data-focus` и `data-focus-visible` — они повторяют `:active`, `:focus` и `:focus-visible`. Hover не срабатывает поверх `data-active`. У `link` скругление `--radius-sm`. У `image` контент по центру, hover и active оставляют фон `--color-secondary`.

## 0.1.10

### Patch Changes

- `Button` принимает `asChild`: классы, `ref` и обработчики сливаются в единственного ребёнка, свой `<button>` не рисуется. Проп `href` убран: ссылка — это свой `<a>` или `Link` внутри `asChild`. На `<a>` недоступность идёт через `aria-disabled`, потому что `:disabled` у ссылки не работает.

## 0.1.9

### Patch Changes

- `Button`: варианты `image` и `icon`. `icon` — круг без паддинга, 40px (`sm` 30px, `lg` 52px). `image` — квадрат 60px, с `md` 100px, фон `--color-secondary`, без рамки и с `--radius-sm`. Бейдж по центру картинки — класс `button--image__icon`: круг `--color-primary`, 32px, с `md` 40px.

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
