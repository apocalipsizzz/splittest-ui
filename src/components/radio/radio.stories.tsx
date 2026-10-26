import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioInput } from './radio';

const meta = {
  title: 'Components/Radio',
  component: RadioInput,
  args: {
    title: 'Вариант',
    name: 'demo',
  },
} satisfies Meta<typeof RadioInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Group: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <RadioInput name="group" title="Первый" defaultChecked />
      <RadioInput name="group" title="Второй" />
      <RadioInput name="group" title="Ошибка" error />
      <RadioInput name="group" title="Выключен" disabled />
    </div>
  ),
};
