# @de-kit/st-ui

React-компоненты splittest. Стили едут вместе с компонентом (глобальный SCSS, не CSS-модули). Токены скопированы из `splittest-frontend/src/app/styles`. Tailwind нет.

## Подключение

В CRA и в Vite отдельный импорт CSS не нужен — `import './button.scss'` сидит внутри компонента:

```tsx
import {
  Button,
  Input,
  TextArea,
  CheckboxInput,
  RadioGroup,
  RadioInput,
  Spinner,
} from '@de-kit/st-ui';
```

Иконки — отдельный вход, в бандл попадают только импортированные:

```tsx
import { IconClose, LogoVisa } from '@de-kit/st-ui/icons';

<IconClose />
<IconClose width={16} height={16} aria-label="Закрыть" />
```

`icon_*` и `control_*` — 20×20 и `currentColor`. У стрелок галереи `viewBox` 20×40, рисуются тоже 20×20. Размер меняется пропом `width`/`height` или CSS, он перекрывает дефолт. `icon_label-*` сохраняют заливку. `logo_*` и `illustration_*` — размер из SVG, у иллюстраций чёрный stroke заменён на `currentColor`. Новый svg кладётся в `src/icons/svg`, дальше `pnpm build:icons` (его же зовут `dev` и `build`).

Можно импортировать и по одному компоненту, минуя баррель, — это нужно в Jest и в RSC, где tree-shaking не работает:

```tsx
import { Button } from '@de-kit/st-ui/components/button';
```

`reset.scss` — сброс, типографика и нейтральные стили тегов. `global.scss` — каркас страницы splittest поверх него (`#root`, флексовый `body`, `.wrapper`, вуаль `.body--modal`); в чужой странице подключать только `reset.scss`. Шрифт Inter библиотека не везёт, его по-прежнему грузит фронтенд.

Служебное наружу: `cn` для склейки классов, `Slot` для своего `asChild`, `useFieldControl` для своего контрола внутри `Field`, `filterSelectOptions` для своего фильтра пунктов.

Токены подключаются один раз вместе с пакетом (`import './styles/vars.scss'` в `src/index.ts`). В своих scss это обычные `var()`, `@use` не нужен. `@use '@de-kit/st-ui/vars.scss'` — только если стили собираются без JS.

Миксины — только брейкпоинты для адаптивной вёрстки:

```scss
@use '@de-kit/st-ui/mixins.scss' as mixins;

.card {
  padding: var(--space-2);

  @include mixins.min-width(md) {
    padding: var(--space-3);
  }

  @include mixins.max-width(sm) {
    display: none;
  }
}
```

`sm` 480, `md` 680, `lg` 1000, `xl` 1200. Это единственный источник: `--breakpoint-*` в `vars.scss` генерируются из того же списка, так что новый брейкпоинт в `$breakpoints` сразу даёт и миксин, и токен. Отдельный список нужен потому, что в `@media` custom properties не работают. `min-width` включает брейкпоинт, `max-width` — нет (граница `679.98px`), поэтому на ровно 680px срабатывает только `min-width`. Вместо имени можно передать размер: `min-width(900px)`. Список доступен как `mixins.$breakpoints`, значение — `mixins.breakpoint(md)`.

`var(--color-foreground)`, `var(--color-primary)`, `var(--font-sans)`, `var(--radius-sm)`, `var(--breakpoint-md)`. Цвета — роли как у Tailwind v4, не пигмент: `--color-foreground` текст, `--color-background` страница, `--color-primary` / `--color-primary-foreground` залитая кнопка и текст на ней. Outline берёт `--color-foreground` (текст и рамка, фон прозрачный). `--color-accent` синий, `--color-destructive` ошибка, `--color-success` успех, `--color-warning` жёлтый — из него разбавлен фон `--color-recommended`. Тема — переопределение этих переменных, компоненты не перекрашивать. `--color-overlay` и `--color-shadow` из темы не выводятся: вуаль и тень остаются тёмными и в светлой, и в тёмной, нужен другой оттенок — переопределять их отдельно.

Текст — пара токенов на размер: сам размер и `--text-*--line-height` рядом. Заголовки `reset.scss` собраны из них: h1 и h2 — `2xl` (h1 с 680px — `3xl`), h3 — `lg`, h4 — `sm`. Размеры `Button` `sm` (12/16) и `lg` (16/24) в шкалу не попадают и остаются литералами. Отступы — сетка 5px; паддинги кнопки и инпута сняты с макета вне сетки и тоже литералы. Обводка фокуса — `--focus-ring-width`, `--focus-ring-color` и `--focus-ring-offset`, одна на `box-shadow` инпута и `outline` остальных контролов.

Полный список — ниже, он собирается из `vars.scss` скриптом `pnpm run docs:tokens`, а `verify` проверяет, что он не разъехался.

<!-- tokens:start -->

<!-- Собрано scripts/sync-tokens-doc.mjs из src/styles/vars.scss. Руками не править. -->

**Цвет**

| Токен | Значение |
| --- | --- |
| `--color-background` | `#fff` |
| `--color-foreground` | `#000` |
| `--color-primary` | `#000` |
| `--color-primary-foreground` | `#fff` |
| `--color-primary-hover` | `#000` |
| `--color-secondary` | `#f7f7f7` |
| `--color-muted` | `#e5e5e5` |
| `--color-muted-foreground` | `#808080` |
| `--color-border` | `color-mix(in srgb, var(--color-foreground) 10%, transparent)` |
| `--color-input` | `#d9d9d9` |
| `--color-ring` | `var(--color-foreground)` |
| `--color-overlay` | `rgb(0 0 0 / 0.3)` |
| `--color-shadow` | `rgb(0 0 0 / 0.15)` |
| `--color-sidebar` | `color-mix(in srgb, var(--color-foreground) 3%, transparent)` |
| `--color-accent` | `#0000ff` |
| `--color-accent-foreground` | `#fff` |
| `--color-destructive` | `#ff0000` |
| `--color-success` | `#00a66f` |
| `--color-warning` | `#ffbf00` |

**Радиусы**

| Токен | Значение |
| --- | --- |
| `--radius-sm` | `5px` |
| `--radius-md` | `10px` |
| `--radius-lg` | `30px` |
| `--radius-rounded` | `100%` |

**Текст**

| Токен | Значение |
| --- | --- |
| `--font-sans` | `'Inter', sans-serif` |
| `--font-weight-black` | `900` |
| `--font-weight-bold` | `700` |
| `--font-weight-semibold` | `600` |
| `--font-weight-medium` | `500` |
| `--font-weight-normal` | `400` |
| `--text-xs` | `11px` |
| `--text-xs--line-height` | `15px` |
| `--text-sm` | `14px` |
| `--text-sm--line-height` | `20px` |
| `--text-base` | `16px` |
| `--text-base--line-height` | `20px` |
| `--text-lg` | `18px` |
| `--text-lg--line-height` | `30px` |
| `--text-xl` | `18px` |
| `--text-xl--line-height` | `20px` |
| `--text-2xl` | `27px` |
| `--text-2xl--line-height` | `30px` |
| `--text-3xl` | `36px` |
| `--text-3xl--line-height` | `40px` |
| `--text-4xl` | `45px` |
| `--text-4xl--line-height` | `50px` |

**Отступы**

| Токен | Значение |
| --- | --- |
| `--space-1` | `5px` |
| `--space-2` | `10px` |
| `--space-3` | `15px` |
| `--space-4` | `20px` |
| `--space-5` | `25px` |
| `--space-6` | `30px` |
| `--space-7` | `35px` |
| `--space-8` | `40px` |
| `--space-9` | `45px` |
| `--space-10` | `50px` |
| `--space-11` | `55px` |
| `--space-12` | `60px` |
| `--space-13` | `65px` |
| `--space-14` | `70px` |
| `--space-15` | `75px` |
| `--space-16` | `80px` |

**Фокус и тень**

| Токен | Значение |
| --- | --- |
| `--focus-ring-width` | `1px` |
| `--focus-ring-color` | `var(--color-ring)` |
| `--focus-ring-offset` | `2px` |
| `--shadow-xl` | `0 10px 40px 0 var(--color-shadow)` |

<!-- tokens:end -->

## Стили

Компонентный scss собирает sass хоста — готовый css пакет не эмитит, в браузер уезжают custom properties. Отсюда **требования к сборке у потребителя**:

- в проекте должен стоять `sass` (он заявлен как необязательная peer-зависимость, менеджер пакетов о нём напомнит);
- бандлер должен уметь `import './button.scss'` из `node_modules` — Vite и CRA умеют из коробки;
- в Jest нужен трансформер для `.scss` (`identity-obj-proxy` или `jest-transform-stub`), в Vitest — `css: false` либо установленный `sass`.

Класс в DOM буквальный: `button`, `input`, `checkbox`, `radio`, `textarea`, `spinner`. Корень и модификаторы одинарные (`.button`, `.button--outline`). Внутренние элементы — BEM: `checkbox__input`, `textarea__counter`.

Кроме классов компоненты пишут состояние в `data-*` — это публичный контракт для CSS и тестов, в отличие от внутренних BEM-модификаторов:

| Атрибут | Где | Значения |
| --- | --- | --- |
| `data-state` | `PopupSheet`, `Popover`, `DatePicker`, `Select`, `SelectSearch` | `open`, `closed` |
| `data-invalid` | `Input`, `TextArea`, `CheckboxInput`, `RadioInput`, `RadioGroup`, селекты | есть/нет |
| `data-disabled` | те же контролы и пункты списка | есть/нет |
| `data-highlighted`, `data-selected` | пункт списка в селектах | есть/нет |

У `PopupSheet` `data-state` остаётся `closed` весь кадр перед открытием и всю анимацию закрытия — по нему можно вешать и вход, и выход.

`reset.scss` — сброс, типографика и нейтральные стили тегов, его можно подключать в любом проекте. `global.scss` — каркас страницы splittest (`#root`, флексовый `body`, `.wrapper`, вуаль `.body--modal`); он включает в себя `reset.scss`, но в чужую страницу его тянуть не надо.

## Кнопка

Пропсы как в `shared/components/button`, без `react-router`.

```tsx
<Button onClick={save}>Сохранить</Button>
<Button variant="outline">Отмена</Button>
<Button variant="link" disabled>Скрыть</Button>
<Button asChild>
  <a href="/prices">Тарифы</a>
</Button>
<Button size="sm">Маленькая</Button>
<Button size="lg">Крупная</Button>
<Button fullWidth>Дальше</Button>
<Button>
  <IconArrowLeft width={20} height={20} />
  Назад
</Button>
<Button>
  Дальше
  <IconArrowRight width={20} height={20} />
</Button>
<Button loading>Сохранение</Button>
```

Иконка — обычный `children`, слева или справа, какой набор нужен. `loading` оставляет подпись в потоке (`opacity: 0`) и кладёт спиннер поверх, поэтому ширина не прыгает. Ставит `aria-busy`. Пока `loading`, `<button>` получает `disabled`. У `asChild` на не-кнопке клик отменяется и ставится `aria-disabled`.

| Prop        | По умолчанию |                                                         |
| ----------- | ------------ | ------------------------------------------------------- |
| `variant`   | `default`    | `default` заливка, `outline` обводка, `link` текст, `destructive` красный, `image` и `icon` без подписи |
| `size`      | `md`         | `sm` компактная, `md` обычная, `lg` крупная             |
| `fullWidth` | `false`      | ширина 100%, не зависит от `size`                       |
| `asChild`   | `false`      | классы и пропы на единственном ребёнке, без своего тега |
| `loading`   | `false`      | `aria-busy`, клик блокируется, ширина как у подписи     |

`variant="link"` — это вид кнопки (`font-weight: 400`), не тип элемента. Ссылка — `asChild` вокруг своего `<a>` или `Link`: классы, `ref` и обработчики сливаются в единственного ребёнка, свой `<button>` не рисуется. Ребёнок должен принять `className` и `ref`.

## Остальные

```tsx
<Input recommended />
<Input error />
<Input size="sm" />
<Input noWrap />
<TextArea maxLength={200} />
<TextArea maxLength={200} counter={false} />
<CheckboxInput label="18-24" />
<CheckboxInput label="Согласен" error />
<RadioGroup label="Возраст" name="age" required>
  <RadioInput label="18-24" />
</RadioGroup>
<Spinner position="top" />
<Spinner label="Считаем" size={24} />
```

Тексты, которые видит пользователь, — пропсы: `clearLabel` у `Input` и `PhoneInput`, `counterLabel` у `TextArea` (функция от остатка и максимума), `label` у `Spinner`, `errorFallback` у `Form` — он подставляется, когда `onSubmit` упал без внятного сообщения.

`size` у `Input` и `TextArea` — те же `sm`, `md`, `lg`, что у кнопки. У `Input` высота совпадает с кнопкой ровно: 30, 40 и 52px, включая `type="date"`. У `TextArea` размер меняет паддинги и `min-height`: 120 / 160 / 200px, с 680px — 60 / 80 / 100px. Текст во всех размерах остаётся `--text-sm`. У `Input` проп перекрывает нативный `size` (ширину в символах). `noWrap` убирает `div.input__wrap`: крестик `clearable` от неё позиционируется, поэтому с `noWrap` не рисуется. `counter={false}` заменяет опечатку `noMaxMoty`. Счётчик `TextArea` показывает остаток символов и связан с полем через `aria-describedby`, сам `maxLength` по-прежнему режет ввод. `CheckboxInput` сам ставит `id`, если его не передали. Общий `name` у радио задаёт `RadioGroup`, она же рисует `fieldset` с `role="radiogroup"`. Её `required` делает обязательной всю группу и вне `Field`: `aria-required` уезжает на группу, нативный `required` — на пункты. Красная рамка у `CheckboxInput` и `RadioInput` — это проп `error`; один `required` больше не красит, он только обязывает. `Spinner` тянется по родителю, `position` раскладывает его по высоте, а `label` (по умолчанию «Загрузка») — подпись для скринридера.

## Поле

`Field` оборачивает один контрол: ставит подсказку и ошибку и связывает их через `aria-describedby`, `aria-errormessage` и `role="alert"`. `label` необязателен: без него `<label>` не рисуется, а текст `required` — «Обязательное поле».

```tsx
<Field label="Имя" hint="Нельзя изменить после проверки">
  <Input />
</Field>
<Field label="Почта" required error="Проверьте адрес">
  <Input type="email" />
</Field>
<Field label="Возраст" required>
  <RadioGroup name="age">
    <RadioInput label="18-24" value="18" />
  </RadioGroup>
</Field>
```

Валидацией можно распоряжаться снаружи: проп `invalid` ставит `aria-invalid` на контрол, а собственная проверка обязательности при этом молчит — так поле подключается к react-hook-form или к ответу сервера без борьбы с внутренней эвристикой. Свой контрол внутри `Field` пишется через `useFieldControl` из корня пакета.

Контрол внутри должен быть один: id он берёт у поля, поэтому свой `id` на ребёнке перебивается, а два контрола получат одинаковый. `required` ставит `aria-required` на контрол и показывает ошибку «Поле «Имя» обязательно» (свой текст — проп `requiredMessage`) в двух случаях: когда в поле что-то было, а потом не стало (стёрли текст, сняли галочку) и когда форму не пустила проверка браузера — `Field` ловит `invalid` в фазе захвата. Звёздочки у лейбла нет, обязательность видно по сообщению. У радиогруппы момента «стёрли» не бывает, поэтому её держит нативный `required` на пунктах: форма не отправится, ошибка появится после неудачной отправки и уйдёт, как только выберут вариант. Отсюда и граница: `required` поля работает с нативными контролами — `Input`, `TextArea`, `CheckboxInput`, `RadioGroup`. Произвольный ребёнок не отдаёт ни значения, ни `invalid`, и поле о его пустоте не узнает. `RadioGroup` внутри `Field` легенду не рисует: именем группы становится лейбл поля.

## Слои: PopupSheet, Popover, DatePicker

Все трое рисуются в портале у `body`, а не на месте вызова. `PopupSheet` и лист `DatePicker` — модальные: фокус заперт внутри, остальная страница получает `aria-hidden`, скролл заблокирован общим локом со счётчиком (вложенный слой его не снимает). Закрытый `PopupSheet` в DOM не остаётся. Escape закрывает верхний слой, а не все сразу: слои живут в одном `FloatingTree`.

Состояние у всех трёх — одна триада: управляемое значение, `default*` для неуправляемого и `on*Change` для обоих режимов.

```tsx
<PopupSheet open={open} onOpenChange={setOpen} title="Выйти?">…</PopupSheet>
<PopupSheet defaultOpen title="Выйти?">…</PopupSheet>

<Popover open={open} onOpenChange={setOpen} trigger={<Button>Фильтр</Button>}>…</Popover>
<Popover defaultOpen={false} trigger={<Button>Фильтр</Button>}>…</Popover>

<DatePicker value={date} onChange={setDate} />
<DatePicker defaultValue={new Date(1990, 2, 15)} onChange={save} />
```

`onClose` остаётся как короткая форма «только закрытие».

Якорь `Popover` принадлежит вам, поэтому сам по себе клик по нему панель не открывает — это делает ваш `onClick`. Нужен `Popover`, который живёт без внешнего состояния, — включите `openOnTriggerClick`: тогда якорь переключает панель, а ваш `onClick` на нём продолжает вызываться.

```tsx
<Popover openOnTriggerClick trigger={<Button>Фильтр</Button>}>…</Popover>
```

Подписи у слоёв переопределяются: `closeLabel` у `PopupSheet` и `Popover`; у `DatePicker` — `title`, `dayLabel`, `monthLabel`, `yearLabel`, `applyLabel`, `cancelLabel`, а названия месяцев берутся из `Intl.DateTimeFormat` по пропу `locale` (по умолчанию `ru`, родительный падеж — через `formatToParts`).

## Селекты

`Select` — кнопка и список в портале; `SelectSearch` — то же плюс поиск без регистра, «ё» = «е» и с учётом другой раскладки. Клавиатура как в APG: стрелки, Home/End, PageUp/PageDown, набор с буфером (`мо` ищет префикс, пауза 500 мс начинает заново). `SelectSearch` сообщает число найденных вариантов в живую область.

```tsx
<Select options={options} name="city" emptyText="Городов нет" onOpenChange={log} />
<Select options={options} renderOption={o => <b>{o.label}</b>} />
<SelectSearch options={options} name="bank" searchPlaceholder="Поиск банка" />
```

`label` пункта остаётся строкой: по нему идут поиск и подпись в закрытом поле. Нужна своя разметка строки списка — `renderOption`. Значение в форму отдаёт скрытое, но валидируемое поле, поэтому `required` из `Field` проверяет именно выбор, а не набранный запрос.

## Разработка

```bash
pnpm install
pnpm dev       # Storybook, :6007
pnpm test
pnpm build     # dist: js + d.ts + scss рядом с компонентами
```
