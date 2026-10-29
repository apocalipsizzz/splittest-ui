import type { Meta, StoryObj } from '@storybook/react-vite';

import { CheckboxInput } from '@/components/checkbox';
import { Input } from '@/components/input';
import { RadioGroup, RadioInput } from '@/components/radio';
import { TextArea } from '@/components/textarea';
import { Labeled, LabeledBlock } from '@/stories/labeled';
import { storyStack } from '@/stories/story-stack';
import { Field } from './field';

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
    <div style={storyStack}>
      <LabeledBlock title="подпись и подсказка">
        <Labeled label="label" wide maxWidth={360}>
          <Field label="Фамилия">
            <Input placeholder="Иванов" />
          </Field>
        </Labeled>
        <Labeled label="required" wide maxWidth={360}>
          <Field label="Имя" required>
            <Input placeholder="Пока пусто, ошибки нет" />
          </Field>
        </Labeled>
        <Labeled label="required + requiredMessage" wide maxWidth={360}>
          <Field
            label="Город"
            required
            requiredMessage="Без города никак"
            hint="Сотри текст — появится ошибка"
          >
            <Input defaultValue="Москва" />
          </Field>
        </Labeled>
        <Labeled label="hint" wide maxWidth={360}>
          <Field label="Почта" hint="Нельзя изменить после проверки">
            <Input type="email" defaultValue="jora@test.ru" />
          </Field>
        </Labeled>
        <Labeled label="hint + error" wide maxWidth={360}>
          <Field
            label="Имя"
            hint="Нельзя изменить после проверки"
            error="Имя занято"
          >
            <Input defaultValue="Jora" />
          </Field>
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <Field label="Ник" error="Занят">
            <Input recommended defaultValue="jora" />
          </Field>
        </Labeled>
        <Labeled label="hintPlacement=label" wide maxWidth={360}>
          <Field
            label="Отчество"
            hint="Алгоритм не запутается в однофамильцах."
            hintPlacement="label"
          >
            <Input />
          </Field>
        </Labeled>
        <Labeled label="hintPlacement=label + error" wide maxWidth={360}>
          <Field
            label="Компания"
            hint="Как в договоре"
            hintPlacement="label"
            error="Такой компании нет"
          >
            <Input defaultValue="—" />
          </Field>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="состояние">
        <Labeled label="clearable" wide maxWidth={360}>
          <Field label="Поиск" hint="Можно очистить">
            <Input clearable defaultValue="текст" />
          </Field>
        </Labeled>
        <Labeled label="clearable + error" wide maxWidth={360}>
          <Field label="Запрос" error="Слишком короткий">
            <Input clearable defaultValue="а" />
          </Field>
        </Labeled>
        <Labeled label="type=password" wide maxWidth={360}>
          <Field label="Пароль">
            <Input type="password" defaultValue="secret" />
          </Field>
        </Labeled>
        <Labeled label="type=number" wide maxWidth={360}>
          <Field label="Возраст">
            <Input type="number" placeholder="18" />
          </Field>
        </Labeled>
        <Labeled label="type=date" wide maxWidth={360}>
          <Field label="Дата старта">
            <Input type="date" />
          </Field>
        </Labeled>
        <Labeled label="recommended" wide maxWidth={360}>
          <Field label="Рекомендация">
            <Input recommended placeholder="Лучше заполнить" />
          </Field>
        </Labeled>
        <Labeled label="readOnly" wide maxWidth={360}>
          <Field label="Архив" hint="Только смотреть">
            <Input readOnly defaultValue="закрыто" />
          </Field>
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <Field label="Старый логин">
            <Input disabled defaultValue="нельзя" />
          </Field>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="size">
        <Labeled label="sm" wide maxWidth={360}>
          <Field label="Короткое">
            <Input size="sm" placeholder="sm" />
          </Field>
        </Labeled>
        <Labeled label="md" wide maxWidth={360}>
          <Field label="Обычное">
            <Input placeholder="md" />
          </Field>
        </Labeled>
        <Labeled label="lg" wide maxWidth={360}>
          <Field label="Крупное">
            <Input size="lg" placeholder="lg" />
          </Field>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const TextAreas: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="подпись и подсказка">
        <Labeled label="label" wide maxWidth={360}>
          <Field label="Комментарий">
            <TextArea placeholder="Что пошло не так" />
          </Field>
        </Labeled>
        <Labeled label="hint" wide maxWidth={360}>
          <Field label="Заметка" hint="Коротко">
            <TextArea placeholder="Пара строк" />
          </Field>
        </Labeled>
        <Labeled label="hintPlacement=label" wide maxWidth={360}>
          <Field label="Описание" hint="Без маркетинга" hintPlacement="label">
            <TextArea />
          </Field>
        </Labeled>
        <Labeled label="error + hint" wide maxWidth={360}>
          <Field label="Отзыв" error="Слишком коротко" hint="Минимум пара фраз">
            <TextArea defaultValue="ок" />
          </Field>
        </Labeled>
        <Labeled label="required" wide maxWidth={360}>
          <Field label="Причина" required hint="Сотри текст — появится ошибка">
            <TextArea defaultValue="Не сошлось" />
          </Field>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="состояние">
        <Labeled label="recommended" wide maxWidth={360}>
          <Field label="Черновик">
            <TextArea recommended placeholder="Можно оставить пустым" />
          </Field>
        </Labeled>
        <Labeled label="recommended + error" wide maxWidth={360}>
          <Field label="Черновик с ошибкой" error="Нужен текст">
            <TextArea recommended defaultValue="..." />
          </Field>
        </Labeled>
        <Labeled label="maxLength" wide maxWidth={360}>
          <Field label="Остаток" hint="Счётчик связан с полем">
            <TextArea maxLength={80} defaultValue="Уже набрано" />
          </Field>
        </Labeled>
        <Labeled label="counter=false" wide maxWidth={360}>
          <Field label="Без счётчика">
            <TextArea
              maxLength={80}
              counter={false}
              placeholder="Лимит есть, цифр нет"
            />
          </Field>
        </Labeled>
        <Labeled label="readOnly" wide maxWidth={360}>
          <Field label="Только чтение">
            <TextArea readOnly defaultValue="Готовый текст" />
          </Field>
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <Field label="Закрыто">
            <TextArea disabled defaultValue="нельзя" />
          </Field>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="size">
        <Labeled label="sm" wide maxWidth={360}>
          <Field label="Короткое">
            <TextArea size="sm" placeholder="sm" />
          </Field>
        </Labeled>
        <Labeled label="md" wide maxWidth={360}>
          <Field label="Обычное">
            <TextArea placeholder="md" />
          </Field>
        </Labeled>
        <Labeled label="lg" wide maxWidth={360}>
          <Field label="Крупное">
            <TextArea size="lg" placeholder="lg" />
          </Field>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const Checkboxes: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="подпись и подсказка">
        <Labeled label="label" wide maxWidth={360}>
          <Field label="Согласен с условиями">
            <CheckboxInput />
          </Field>
        </Labeled>
        <Labeled label="hint" wide maxWidth={360}>
          <Field label="Рассылка" hint="Можно отключить позже">
            <CheckboxInput label="На почту" defaultChecked />
          </Field>
        </Labeled>
        <Labeled label="required" wide maxWidth={360}>
          <Field
            label="Согласие"
            required
            hint="Сними галочку — появится ошибка"
          >
            <CheckboxInput defaultChecked />
          </Field>
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <Field label="Оферта" error="Нужно согласие">
            <CheckboxInput label="Принимаю" />
          </Field>
        </Labeled>
        <Labeled label="hintPlacement=label + error" wide maxWidth={360}>
          <Field
            label="Правила"
            hint="Иначе заявку не отправим"
            hintPlacement="label"
            error="Отметь пункт"
          >
            <CheckboxInput />
          </Field>
        </Labeled>
      </LabeledBlock>
      <LabeledBlock title="состояние">
        <Labeled label="indeterminate" wide maxWidth={360}>
          <Field label="Выбрать всё">
            <CheckboxInput label="Все аудитории" indeterminate />
          </Field>
        </Labeled>
        <Labeled label="indeterminate + error" wide maxWidth={360}>
          <Field label="Частично и с ошибкой" error="Выбор неполный">
            <CheckboxInput label="18-24" indeterminate />
          </Field>
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <Field label="Недоступно">
            <CheckboxInput label="Архив" disabled />
          </Field>
        </Labeled>
        <Labeled label="disabled + checked" wide maxWidth={360}>
          <Field label="Уже включено">
            <CheckboxInput label="Уведомления" disabled defaultChecked />
          </Field>
        </Labeled>
        <Labeled label="clickable=false" wide maxWidth={360}>
          <Field
            label="Только с клавиатуры"
            hint="Квадрат не кликается, лейбл кликается"
          >
            <CheckboxInput label="Пункт" clickable={false} />
          </Field>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};

export const Radios: Story = {
  render: () => (
    <div style={storyStack}>
      <LabeledBlock title="группа">
        <Labeled label="required" wide maxWidth={360}>
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
        </Labeled>
        <Labeled label="hintPlacement=label" wide maxWidth={360}>
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
        </Labeled>
        <Labeled label="error" wide maxWidth={360}>
          <Field label="Оплата" error="Выбери способ">
            <RadioGroup name="pay">
              <div style={options}>
                <RadioInput label="Карта" value="card" />
                <RadioInput label="Счёт" value="invoice" />
              </div>
            </RadioGroup>
          </Field>
        </Labeled>
        <Labeled label="hint + error" wide maxWidth={360}>
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
        </Labeled>
        <Labeled label="disabled" wide maxWidth={360}>
          <Field label="Архивный тариф">
            <RadioGroup name="legacy">
              <div style={options}>
                <RadioInput
                  label="Старый"
                  value="old"
                  disabled
                  defaultChecked
                />
                <RadioInput label="Ещё старше" value="older" disabled />
              </div>
            </RadioGroup>
          </Field>
        </Labeled>
      </LabeledBlock>
    </div>
  ),
};
