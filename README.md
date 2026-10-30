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

`icon_*` и `control_*` — 20×20 и `currentColor` (галерея 20×40). Размер меняется пропом `width`/`height` или CSS, он перекрывает дефолт. `icon_label-*` сохраняют заливку. `logo_*` и `illustration_*` — размер из SVG, у иллюстраций чёрный stroke заменён на `currentColor`. Новый svg кладётся в `src/icons/svg`, дальше `pnpm build:icons` (его же зовут `dev` и `build`).

`global.scss` — база приложения (body, заголовки, таблицы, `.wrapper`). В чужой странице его не подключать. Шрифт Inter библиотека не везёт, его по-прежнему грузит фронтенд.

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

Текст — пара токенов на размер, других размеров в splittest нет: `--text-xs` (11/15), `--text-sm` (14/20, по умолчанию почти везде), `--text-base` (16/20), `--text-lg` (18/20), `--text-2xl` (28/30), `--text-3xl` (45/50); высота строки — `--text-*--line-height`. Заголовки `global.scss` собраны из них: h1 и h2 — `2xl` (h1 с 680px — `3xl`), h3 — `lg`, h4 — `sm`. Размеры `Button` `sm` (12/16) и `lg` (16/24) в шкалу не попадают и остаются литералами. Отступы — сетка 5px: `--space-1` … `--space-6`; паддинги кнопки и инпута сняты с макета вне сетки и остаются литералами. Обводка фокуса — `--focus-ring-width`, `--focus-ring-color` и `--focus-ring-offset`, одна на `box-shadow` инпута и `outline` остальных контролов.

Компонентный scss собирает sass хоста. Класс в DOM буквальный: `button`, `input`, `checkbox`, `radio`, `textarea`, `spinner`. Корень и модификаторы одинарные (`.button`, `.button--outline`). Внутренние элементы — BEM: `checkbox__input`, `textarea__counter`.

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
| `variant`   | `default`    | `default` заливка, `outline` обводка, `link` текст      |
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

`size` у `Input` и `TextArea` — те же `sm`, `md`, `lg`, что у кнопки. У `Input` высота совпадает с кнопкой ровно: 30, 40 и 52px, включая `type="date"`. У `TextArea` размер меняет паддинги и `min-height`: 120 / 160 / 200px, с 680px — 60 / 80 / 100px. Текст во всех размерах остаётся `--text-sm`. У `Input` проп перекрывает нативный `size` (ширину в символах). `counter={false}` заменяет опечатку `noMaxMoty`. Счётчик `TextArea` показывает остаток символов и связан с полем через `aria-describedby`, сам `maxLength` по-прежнему режет ввод. `CheckboxInput` сам ставит `id`, если его не передали. Общий `name` у радио задаёт `RadioGroup`, она же рисует `fieldset` с `role="radiogroup"`. Её `required` делает обязательной всю группу и вне `Field`: `aria-required` уезжает на группу, нативный `required` — на пункты. Красная рамка у `CheckboxInput` и `RadioInput` — это проп `error`; один `required` больше не красит, он только обязывает. `Spinner` тянется по родителю, `position` раскладывает его по высоте, а `label` (по умолчанию «Загрузка») — подпись для скринридера.

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

Контрол внутри должен быть один: id он берёт у поля, поэтому свой `id` на ребёнке перебивается, а два контрола получат одинаковый. `required` ставит `aria-required` на контрол и показывает ошибку «Поле «Имя» обязательно» (свой текст — проп `requiredMessage`) в двух случаях: когда в поле что-то было, а потом не стало (стёрли текст, сняли галочку) и когда форму не пустила проверка браузера — `Field` ловит `invalid` в фазе захвата. Звёздочки у лейбла нет, обязательность видно по сообщению. У радиогруппы момента «стёрли» не бывает, поэтому её держит нативный `required` на пунктах: форма не отправится, ошибка появится после неудачной отправки и уйдёт, как только выберут вариант. Отсюда и граница: `required` поля работает с нативными контролами — `Input`, `TextArea`, `CheckboxInput`, `RadioGroup`. Произвольный ребёнок не отдаёт ни значения, ни `invalid`, и поле о его пустоте не узнает. `RadioGroup` внутри `Field` легенду не рисует: именем группы становится лейбл поля.

## Разработка

```bash
pnpm install
pnpm dev       # Storybook, :6006
pnpm test
pnpm build     # dist: js + d.ts + scss рядом с компонентами
```
