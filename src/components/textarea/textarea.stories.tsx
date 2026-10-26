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

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 360 }}>
      <TextArea placeholder="Счётчик" maxLength={80} />
      <TextArea placeholder="Без счётчика" maxLength={80} hideCounter />
      <TextArea placeholder="Ошибка" error defaultValue="текст" />
    </div>
  ),
};
