import type { Meta, StoryObj } from '@storybook/react-vite';

import { Spinner } from './spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Center: Story = {};

export const Top: Story = {
  args: { position: 'top' },
  render: args => (
    <div style={{ height: 160, border: '1px solid #e5e5e5' }}>
      <Spinner {...args} />
    </div>
  ),
};
