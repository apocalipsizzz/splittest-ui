import type { Meta, StoryObj } from '@storybook/react-vite';

import { CheckboxInput } from './checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: CheckboxInput,
  args: {
    label: 'Согласен',
  },
} satisfies Meta<typeof CheckboxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <CheckboxInput label="Не выбран" />
      <CheckboxInput label="Выбран" defaultChecked />
      <CheckboxInput label="Частично" indeterminate />
      <CheckboxInput label="Частично и выбран" indeterminate defaultChecked />
      <CheckboxInput label="Выключен" disabled />
      <CheckboxInput label="Выключен и выбран" disabled defaultChecked />
      <CheckboxInput label="С ошибкой" error />
      <CheckboxInput label="Ошибка и выбран" error defaultChecked />
      <CheckboxInput label="Квадрат не кликается" clickable={false} />
      <CheckboxInput />
    </div>
  ),
};
