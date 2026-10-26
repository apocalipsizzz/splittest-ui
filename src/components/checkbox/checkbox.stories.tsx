import type { Meta, StoryObj } from '@storybook/react-vite';

import { CheckboxInput } from './checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: CheckboxInput,
  args: {
    title: 'Согласен',
  },
} satisfies Meta<typeof CheckboxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <CheckboxInput title="Не выбран" />
      <CheckboxInput title="Выбран" defaultChecked />
      <CheckboxInput title="Выключен" disabled defaultChecked />
      <CheckboxInput title="Обязательный" required />
    </div>
  ),
};
