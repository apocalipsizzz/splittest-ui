import type { Meta, StoryObj } from '@storybook/react-vite';

import { CheckboxInput } from '@/components/checkbox';
import { Input } from '@/components/input';
import { RadioGroup, RadioInput } from '@/components/radio';
import { TextArea } from '@/components/textarea';
import { Field } from './field';

const stack = {
  display: 'grid',
  gap: 28,
  width: 360,
} as const;

const options = {
  display: 'grid',
  gap: 8,
} as const;

const meta = {
  title: 'Components/Field',
  component: Field,
  args: {
    label: 'Имя',
    hint: 'Нельзя изменить после проверки',
    children: <Input defaultValue="Jora" />,
  },
  argTypes: {
    children: { control: false },
    hint: { control: 'text' },
    error: { control: 'text' },
    hintPlacement: {
      control: 'inline-radio',
      options: ['bottom', 'label'],
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Inputs: Story = {
  render: () => (
    <div style={stack}>
      <Field label="Фамилия">
        <Input placeholder="Иванов" />
      </Field>
      <Field label="Имя" required>
        <Input placeholder="Пока пусто, ошибки нет" />
      </Field>
      <Field
        label="Город"
        required
        requiredMessage="Без города никак"
        hint="Сотри текст — появится ошибка"
      >
        <Input defaultValue="Москва" />
      </Field>
      <Field label="Почта" hint="Нельзя изменить после проверки">
        <Input type="email" defaultValue="jora@test.ru" />
      </Field>
      <Field
        label="Имя"
        hint="Нельзя изменить после проверки"
        error="Имя занято"
      >
        <Input defaultValue="Jora" />
      </Field>
      <Field label="Ник" error="Занят">
        <Input recommended defaultValue="jora" />
      </Field>
      <Field
        label="Отчество"
        hint="Алгоритм не запутается в однофамильцах."
        hintPlacement="label"
      >
        <Input />
      </Field>
      <Field
        label="Компания"
        hint="Как в договоре"
        hintPlacement="label"
        error="Такой компании нет"
      >
        <Input defaultValue="—" />
      </Field>
      <Field label="Поиск" hint="Можно очистить">
        <Input clearable defaultValue="текст" />
      </Field>
      <Field label="Запрос" error="Слишком короткий">
        <Input clearable defaultValue="а" />
      </Field>
      <Field label="Пароль">
        <Input type="password" defaultValue="secret" />
      </Field>
      <Field label="Возраст">
        <Input type="number" placeholder="18" />
      </Field>
      <Field label="Дата старта">
        <Input type="date" />
      </Field>
      <Field label="Рекомендация">
        <Input recommended placeholder="Лучше заполнить" />
      </Field>
      <Field label="Архив" hint="Только смотреть">
        <Input readOnly defaultValue="закрыто" />
      </Field>
      <Field label="Старый логин">
        <Input disabled defaultValue="нельзя" />
      </Field>
      <Field label="Короткое">
        <Input size="sm" placeholder="sm" />
      </Field>
      <Field label="Обычное">
        <Input placeholder="md" />
      </Field>
      <Field label="Крупное">
        <Input size="lg" placeholder="lg" />
      </Field>
    </div>
  ),
};

export const TextAreas: Story = {
  render: () => (
    <div style={stack}>
      <Field label="Комментарий">
        <TextArea placeholder="Что пошло не так" />
      </Field>
      <Field label="Заметка" hint="Коротко">
        <TextArea placeholder="Пара строк" />
      </Field>
      <Field label="Описание" hint="Без маркетинга" hintPlacement="label">
        <TextArea />
      </Field>
      <Field label="Отзыв" error="Слишком коротко" hint="Минимум пара фраз">
        <TextArea defaultValue="ок" />
      </Field>
      <Field label="Причина" required hint="Сотри текст — появится ошибка">
        <TextArea defaultValue="Не сошлось" />
      </Field>
      <Field label="Черновик">
        <TextArea recommended placeholder="Можно оставить пустым" />
      </Field>
      <Field label="Черновик с ошибкой" error="Нужен текст">
        <TextArea recommended defaultValue="..." />
      </Field>
      <Field label="Остаток" hint="Счётчик связан с полем">
        <TextArea maxLength={80} defaultValue="Уже набрано" />
      </Field>
      <Field label="Без счётчика">
        <TextArea
          maxLength={80}
          counter={false}
          placeholder="Лимит есть, цифр нет"
        />
      </Field>
      <Field label="Только чтение">
        <TextArea readOnly defaultValue="Готовый текст" />
      </Field>
      <Field label="Закрыто">
        <TextArea disabled defaultValue="нельзя" />
      </Field>
      <Field label="Короткое">
        <TextArea size="sm" placeholder="sm" />
      </Field>
      <Field label="Обычное">
        <TextArea placeholder="md" />
      </Field>
      <Field label="Крупное">
        <TextArea size="lg" placeholder="lg" />
      </Field>
    </div>
  ),
};

export const Checkboxes: Story = {
  render: () => (
    <div style={stack}>
      <Field label="Согласен с условиями">
        <CheckboxInput />
      </Field>
      <Field label="Рассылка" hint="Можно отключить позже">
        <CheckboxInput label="На почту" defaultChecked />
      </Field>
      <Field label="Согласие" required hint="Сними галочку — появится ошибка">
        <CheckboxInput defaultChecked />
      </Field>
      <Field label="Оферта" error="Нужно согласие">
        <CheckboxInput label="Принимаю" />
      </Field>
      <Field
        label="Правила"
        hint="Иначе заявку не отправим"
        hintPlacement="label"
        error="Отметь пункт"
      >
        <CheckboxInput />
      </Field>
      <Field label="Выбрать всё">
        <CheckboxInput label="Все аудитории" indeterminate />
      </Field>
      <Field label="Частично и с ошибкой" error="Выбор неполный">
        <CheckboxInput label="18-24" indeterminate />
      </Field>
      <Field label="Недоступно">
        <CheckboxInput label="Архив" disabled />
      </Field>
      <Field label="Уже включено">
        <CheckboxInput label="Уведомления" disabled defaultChecked />
      </Field>
      <Field
        label="Только с клавиатуры"
        hint="Квадрат не кликается, лейбл кликается"
      >
        <CheckboxInput label="Пункт" clickable={false} />
      </Field>
    </div>
  ),
};

export const Radios: Story = {
  render: () => (
    <div style={stack}>
      <Field
        label="Возраст"
        required
        hint="Один вариант. Пустую группу стереть нельзя"
      >
        <RadioGroup name="age">
          <div style={options}>
            <RadioInput label="18-24" value="18" defaultChecked />
            <RadioInput label="25-34" value="25" />
            <RadioInput label="35+" value="35" />
          </div>
        </RadioGroup>
      </Field>
      <Field
        label="Тариф"
        hint="После оплаты не меняется"
        hintPlacement="label"
      >
        <RadioGroup name="plan">
          <div style={options}>
            <RadioInput label="Старт" value="start" />
            <RadioInput label="Про" value="pro" />
          </div>
        </RadioGroup>
      </Field>
      <Field label="Оплата" error="Выбери способ">
        <RadioGroup name="pay">
          <div style={options}>
            <RadioInput label="Карта" value="card" />
            <RadioInput label="Счёт" value="invoice" />
          </div>
        </RadioGroup>
      </Field>
      <Field
        label="Доставка"
        hint="Курьер только по городу"
        error="Этот вариант недоступен"
      >
        <RadioGroup name="delivery">
          <div style={options}>
            <RadioInput label="Самовывоз" value="pickup" defaultChecked />
            <RadioInput label="Курьер" value="courier" error />
          </div>
        </RadioGroup>
      </Field>
      <Field label="Архивный тариф">
        <RadioGroup name="legacy">
          <div style={options}>
            <RadioInput label="Старый" value="old" disabled defaultChecked />
            <RadioInput label="Ещё старше" value="older" disabled />
          </div>
        </RadioGroup>
      </Field>
    </div>
  ),
};
