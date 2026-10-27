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
<Button outline>Отмена</Button>
<Button transparent disabled>Скрыть</Button>
<Button href="/prices">Тарифы</Button>
<Button fullWidth>Дальше</Button>
```

| Prop                                                       | По умолчанию |                                            |
| ---------------------------------------------------------- | ------------ | ------------------------------------------ |
| `transparent` / `outline` / `empty` / `link` / `nopadding` | `false`      | варианты из `index.module.scss` приложения |
| `withIcon`                                                 | `true`       | как в приложении: левый паддинг под иконку |
| `fullWidth`                                                | `false`      | `width: 100%`                              |
| `href`                                                     | —            | рендер `<a>`, не `<Link>`                  |

`link` — это `font-weight: 400`, не тип элемента.

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
