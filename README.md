# @de-kit/st-ui

React-компоненты splittest. Стили — SCSS-модули, токены скопированы из `splittest-frontend/src/app/styles`. Tailwind нет.

## Подключение

В CRA (sass уже стоит):

```tsx
import '@de-kit/st-ui/global.scss';
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

Свои экраны могут брать те же переменные:

```scss
@import '@de-kit/st-ui/vars.scss';
@import '@de-kit/st-ui/mixins.scss';
```

Компонентный css собирает sass-loader приложения: js импортирует `*.module.scss`, классы хешируются на стороне хоста.

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
pnpm build     # dist: js + d.ts + scss рядом с модулями
```
