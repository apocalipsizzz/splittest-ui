import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextArea } from './textarea';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  args: {
    placeholder: 'Комментарий',
    maxLength: 120,
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <TextArea size="sm" placeholder="sm" />
      <TextArea placeholder="md" />
      <TextArea size="lg" placeholder="lg" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <TextArea
        placeholder="Счётчик"
        maxLength={80}
        defaultValue="Уже набрано"
      />
      <TextArea placeholder="Без счётчика" maxLength={80} counter={false} />
      <TextArea placeholder="Рекомендуем" recommended />
      <TextArea placeholder="Ошибка" error defaultValue="текст" />
      <TextArea recommended error defaultValue="спорно" />
      <TextArea readOnly defaultValue="только чтение" />
      <TextArea disabled defaultValue="нельзя" />
    </div>
  ),
};
