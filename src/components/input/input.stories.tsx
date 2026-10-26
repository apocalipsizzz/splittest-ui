import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Название теста',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <Input placeholder="Обычный" />
      <Input placeholder="Рекомендуем" recommended />
      <Input placeholder="Ошибка" error defaultValue="пусто" />
      <Input placeholder="Выключен" disabled defaultValue="нельзя" />
    </div>
  ),
};
