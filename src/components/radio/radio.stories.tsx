import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioGroup, RadioInput } from './radio';

const meta = {
  title: 'Components/Radio',
  component: RadioInput,
  args: {
    label: 'Вариант',
    name: 'demo',
  },
} satisfies Meta<typeof RadioInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Alone: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <RadioInput name="alone" label="Вне группы" value="a" />
      <RadioInput name="alone" label="Тот же name" value="b" defaultChecked />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <RadioGroup label="Группа" name="group">
        <div style={{ display: 'grid', gap: 8 }}>
          <RadioInput label="Первый" value="1" defaultChecked />
          <RadioInput label="Второй" value="2" />
          <RadioInput label="Ошибка" value="3" error />
          <RadioInput label="Выключен" value="5" disabled />
        </div>
      </RadioGroup>
      <RadioGroup label="Ошибка и выбран" name="group-error">
        <RadioInput label="Ошибка и выбран" value="4" error defaultChecked />
      </RadioGroup>
      <RadioGroup label="Выключен и выбран" name="group-disabled">
        <RadioInput
          label="Выключен и выбран"
          value="6"
          disabled
          defaultChecked
        />
      </RadioGroup>
    </div>
  ),
};
