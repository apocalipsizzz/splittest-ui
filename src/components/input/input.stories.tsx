import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Название теста',
  },
  argTypes: {
    clearable: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <Input size="sm" placeholder="sm, 30px" />
      <Input placeholder="md, 40px" />
      <Input size="lg" placeholder="lg, 52px" />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <Input type="text" placeholder="text" />
      <Input type="email" placeholder="name@test.ru" />
      <Input type="password" placeholder="Пароль" defaultValue="secret" />
      <Input type="number" placeholder="18" />
      <Input type="search" placeholder="Поиск" clearable defaultValue="тест" />
      <Input type="date" aria-label="Дата" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <Input placeholder="Обычный" />
      <Input placeholder="Рекомендуем" recommended />
      <Input placeholder="Ошибка" error defaultValue="пусто" />
      <Input recommended error defaultValue="и то и другое" />
      <Input placeholder="Выключен" disabled defaultValue="нельзя" />
      <Input readOnly defaultValue="только чтение" />
      <Input placeholder="Пустой, крестика нет" clearable />
      <Input placeholder="С очисткой" clearable defaultValue="текст" />
      <Input clearable error defaultValue="а" />
    </div>
  ),
};
