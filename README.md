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

Токены подключаются один раз вместе с пакетом (`import './styles/vars.scss'` в `src/index.ts`). В своих scss это обычные `var()`, `@use` не нужен. `@use '@de-kit/st-ui/vars.scss'` — только если стили собираются без JS. Миксины отдельно:

```scss
@use '@de-kit/st-ui/mixins.scss' as mixins;
```

`var(--color-black)`, `var(--font-sans)`, `var(--radius-sm)`, `var(--breakpoint-md)`. Имена как у Tailwind, значения splittest.

Компонентный scss собирает sass хоста. Класс в DOM буквальный: `button`, `input`, `checkbox`, `radio`, `textarea`, `spinner`. Корень и модификаторы одинарные (`.button`, `.button--outline`). Внутренние элементы — BEM: `checkbox__input`, `textarea__counter`.

## Кнопка

Пропсы как в `shared/components/button`, без `react-router`.

```tsx
<Button onClick={save}>Сохранить</Button>
<Button variant="outline">Отмена</Button>
<Button variant="link" disabled>Скрыть</Button>
<Button href="/prices">Тарифы</Button>
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
<Button>
  <IconSpinner className="button__icon--spin" width={20} height={20} />
  Сохранение
</Button>
```

Иконка — обычный `children`, слева или справа, какой набор нужен. Класс `button__icon--spin` крутит спиннер.

| Prop        | По умолчанию |                                                    |
| ----------- | ------------ | -------------------------------------------------- |
| `variant`   | `default`    | `default` заливка, `outline` обводка, `link` текст |
| `size`      | `md`         | `sm` компактная, `md` обычная, `lg` крупная        |
| `fullWidth` | `false`      | ширина 100%, не зависит от `size`                  |
| `href`      | —            | рендер `<a>`, не `<Link>`                          |

`variant="link"` — это вид кнопки (`font-weight: 400`), не тип элемента. Ссылка — отдельный проп `href`.

## Остальные

```tsx
<Input recommended />
<Input error />
<TextArea maxLength={200} />
<TextArea maxLength={200} hideCounter />
<CheckboxInput title="18-24" />
<RadioInput name="age" title="18–24" />
<Spinner position="top" />
```

`hideCounter` заменяет опечатку `noMaxMoty`. `CheckboxInput` сам ставит `id`, если его не передали. Дефис в `title` чекбокса по-прежнему меняется на тире.

## Разработка

```bash
pnpm install
pnpm dev       # Storybook, :6006
pnpm test
pnpm build     # dist: js + d.ts + scss рядом с компонентами
```
